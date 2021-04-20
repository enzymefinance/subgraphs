import { Address, Entity, ethereum } from '@graphprotocol/graph-ts';
import { ERC20Contract } from '../generated/ERC20Contract';
import { Fund, HoldingState, PortfolioState } from '../generated/schema';
import { VaultLibContract } from '../generated/VaultLibContract';
import { arrayUnique } from '../utils/arrayUnique';
import { logCritical } from '../utils/logCritical';
import { toBigDecimal } from '../utils/toBigDecimal';
import { ensureAsset } from './Asset';
import { ensureFundState, useFundState } from './FundState';
import { createHoldingState, findHoldingState, useHoldingState } from './HoldingState';
import { trackNetworkAssetHoldings } from './NetworkAssetHolding';

export function portfolioStateId(fund: Fund, event: ethereum.Event): string {
  return fund.id + '/' + event.block.timestamp.toString() + '/portfolio';
}

export function createPortfolioState(
  holdings: HoldingState[],
  fund: Fund,
  event: ethereum.Event,
  cause: Entity | null,
): PortfolioState {
  let portfolio = new PortfolioState(portfolioStateId(fund, event));
  portfolio.timestamp = event.block.timestamp;
  portfolio.fund = fund.id;
  portfolio.holdings = holdings.map<string>((item) => item.id);
  portfolio.events = cause ? [cause.getString('id')] : new Array<string>();
  portfolio.save();

  return portfolio;
}

export function ensurePortfolioState(fund: Fund, event: ethereum.Event, cause: Entity): PortfolioState {
  let portfolio = PortfolioState.load(portfolioStateId(fund, event)) as PortfolioState;

  if (!portfolio) {
    let state = useFundState(fund.state);
    let previous = usePortfolioState(state.portfolio).holdings;
    let records = previous.map<HoldingState>((id) => useHoldingState(id));
    portfolio = createPortfolioState(records, fund, event, cause);
  } else {
    let events = portfolio.events;
    portfolio.events = arrayUnique<string>(events.concat([cause.getString('id')]));
    portfolio.save();
  }

  return portfolio;
}

export function usePortfolioState(id: string): PortfolioState {
  let porfolio = PortfolioState.load(id) as PortfolioState;
  if (porfolio == null) {
    logCritical('Failed to load fund porfolio {}.', [id]);
  }

  return porfolio;
}

export function trackPortfolioState(fund: Fund, event: ethereum.Event, cause: Entity): PortfolioState {
  let portfolio = ensurePortfolioState(fund, event, cause);
  let previousHoldings: HoldingState[] = portfolio.holdings.map<HoldingState>((id) => useHoldingState(id));
  let nextHoldings: HoldingState[] = new Array<HoldingState>();

  let vaultProxyAddress = Address.fromString(fund.id);
  let vaultProxy = VaultLibContract.bind(vaultProxyAddress);
  let trackedAssets = vaultProxy.getTrackedAssets();

  for (let i: i32 = 0; i < trackedAssets.length; i++) {
    let assetAddress = trackedAssets[i];
    let assetContract = ERC20Contract.bind(assetAddress);
    let assetBalance = assetContract.balanceOf(vaultProxyAddress);

    let asset = ensureAsset(assetAddress);
    let quantity = toBigDecimal(assetBalance, asset.decimals);

    // Add the fund holding entry for the current asset.
    let match = findHoldingState(previousHoldings, asset) as HoldingState;

    // Re-use the previous holding entry unless it has changed.
    if (match != null && match.amount == quantity) {
      nextHoldings = nextHoldings.concat([match]);
    } else {
      nextHoldings = nextHoldings.concat([createHoldingState(asset, quantity, fund, event, cause)]);
    }
  }

  portfolio.holdings = nextHoldings.map<string>((item) => item.id);
  portfolio.save();

  let state = ensureFundState(fund, event);
  let events = state.events;
  state.events = arrayUnique<string>(events.concat(portfolio.events));
  state.portfolio = portfolio.id;
  state.save();

  fund.portfolio = portfolio.id;
  fund.save();

  trackNetworkAssetHoldings(previousHoldings, nextHoldings, event);

  return portfolio;
}
