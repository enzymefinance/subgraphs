import { BigDecimal, ethereum, Entity, Address } from '@graphprotocol/graph-ts';
import {
  Investment,
  Account,
  Asset,
  Fund,
  SharesAddition,
  SharesRedemption,
  Holding,
  Portfolio,
} from '../generated/schema';
import { logCritical } from '../utils/logCritical';
import { contractEventId } from './Event';
import { trackFundShares } from './Shares';
import { useFund } from './Fund';
import { useState } from './State';
import { arrayUnique } from '../utils/arrayUnique';
import { useAsset } from './Asset';
import { toBigDecimal } from '../utils/tokenValue';
import { VaultLibContract } from '../generated/VaultLibContract';

export function portfolioId(fund: Fund, event: ethereum.Event): string {
  return fund.id + '/' + event.block.timestamp.toString() + '/portfolio';
}

export function createPortfolio(
  holdings: Holding[],
  fund: Fund,
  event: ethereum.Event,
  cause: Entity | null,
): Portfolio {
  let portfolio = new Portfolio(portfolioId(fund, event));
  portfolio.timestamp = event.block.timestamp;
  portfolio.fund = fund.id;
  portfolio.holdings = holdings.map<string>((item) => item.id);
  portfolio.events = cause ? [cause.getString('id')] : [];
  portfolio.save();

  return portfolio;
}

export function ensurePortfolio(fund: Fund, event: ethereum.Event, cause: Entity): Portfolio {
  let portfolio = Portfolio.load(portfolioId(fund, event)) as Portfolio;

  if (!portfolio) {
    let state = useState(fund.state);
    let previous = usePortfolio(state.portfolio).holdings;
    let records = previous.map<Holding>((id) => useHolding(id));
    portfolio = createPortfolio(records, fund, event, cause);
  } else {
    let events = portfolio.events;
    portfolio.events = arrayUnique<string>(events.concat([cause.getString('id')]));
    portfolio.save();
  }

  return portfolio;
}

export function usePortfolio(id: string): Portfolio {
  let porfolio = Portfolio.load(id);
  if (porfolio == null) {
    logCritical('Failed to load fund porfolio {}.', [id]);
  }

  return porfolio as Portfolio;
}

function holdingId(asset: Asset, fund: Fund, event: ethereum.Event): string {
  return fund.id + '/' + asset.id + '/' + event.block.timestamp.toString() + '/holding';
}

function createHolding(asset: Asset, quantity: BigDecimal, fund: Fund, event: ethereum.Event, cause: Entity): Holding {
  let holding = new Holding(holdingId(asset, fund, event));
  holding.timestamp = event.block.timestamp;
  holding.fund = fund.id;
  holding.asset = asset.id;
  holding.quantity = quantity;
  holding.events = [cause.getString('id')];
  holding.save();

  return holding;
}

export function useHolding(id: string): Holding {
  let holdings = Holding.load(id);
  if (holdings == null) {
    logCritical('Failed to load fund holdings {}.', [id]);
  }

  return holdings as Holding;
}

function findHolding(holdings: Holding[], asset: Asset): Holding | null {
  for (let i: i32 = 0; i < holdings.length; i++) {
    if (holdings[i].asset == asset.id) {
      return holdings[i];
    }
  }

  return null;
}

export function trackFundPortfolio(fund: Fund, event: ethereum.Event, cause: Entity): Portfolio {
  let portfolio = ensurePortfolio(fund, event, cause);
  let previousHoldings: Holding[] = portfolio.holdings.map<Holding>((id) => useHolding(id));
  let nextHoldings: Holding[] = [];

  let vaultProxy = VaultLibContract.bind(Address.fromString(fund.id));

  let trackedAssets = vaultProxy.getTrackedAssets();
  let assetBalances = vaultProxy.getAssetBalances(trackedAssets);

  for (let i: i32 = 0; i < trackedAssets.length; i++) {
    let asset = useAsset(trackedAssets[i].toHex());
    let quantity = toBigDecimal(assetBalances[i], asset.decimals);

    // Add the fund holding entry for the current asset unless it's 0.
    if (!quantity.digits.isZero()) {
      let match = findHolding(previousHoldings, asset) as Holding;

      // Re-use the previous holding entry unless it has changed.
      if (match != null && match.quantity == quantity) {
        nextHoldings.push(match);
      } else {
        nextHoldings.push(createHolding(asset, quantity, fund, event, cause));
      }
    }
  }

  portfolio.holdings = nextHoldings.map<string>((item) => item.id);
  portfolio.save();

  let state = useState(fund.state);
  let events = state.events;
  state.events = arrayUnique<string>(events.concat(portfolio.events));
  state.portfolio = portfolio.id;
  state.save();

  fund.portfolio = portfolio.id;
  fund.save();

  return portfolio;
}
