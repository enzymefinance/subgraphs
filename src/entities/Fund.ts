import { Address, DataSourceTemplate, BigDecimal } from '@graphprotocol/graph-ts';
import { hexToAscii } from '../utils/hexToAscii';
import { logCritical } from '../utils/logCritical';
import { Fund, Asset } from '../generated/schema';
import { Context } from '../context';
import { useAsset } from './Asset';
import { createFees } from './Fee';
import { createState, createShares, createPortfolio, createPayout } from './Tracking';

export function useFund(id: string): Fund {
  let fund = Fund.load(id);
  if (fund == null) {
    logCritical('Failed to load fund {}.', [id]);
  }

  return fund as Fund;
}

export function createFund(address: Address, context: Context): Fund {
  let fund = new Fund(address.toHex());
  context.entities.fund = fund;

  let shares = createShares(BigDecimal.fromString('0'), null, context);
  let portfolio = createPortfolio([], null, context);
  let payout = createPayout([], null, context);
  let state = createState(shares, portfolio, payout, context);
  context.entities.state = state;

  let fees = createFees(context);

  fund.name = hexToAscii(context.contracts.hub.name());
  fund.inception = context.event.block.timestamp;
  fund.version = context.version;
  fund.manager = context.manager;
  fund.shares = shares.id;
  fund.portfolio = portfolio.id;
  fund.state = state.id;
  fund.active = true;
  fund.denominationAsset = denominationAsset(context).id;
  fund.investable = investableAssets(context).map<string>((item) => item.id);
  fund.payouts = payout.id;
  fund.fees = fees.map<string>((fee) => fee.id);
  fund.save();

  DataSourceTemplate.createWithContext('HubContract', [context.hub], context.context);
  DataSourceTemplate.createWithContext('AccountingContract', [context.accounting], context.context);
  DataSourceTemplate.createWithContext('FeeManagerContract', [context.fees], context.context);
  DataSourceTemplate.createWithContext('ParticipationContract', [context.participation], context.context);
  DataSourceTemplate.createWithContext('PolicyManagerContract', [context.policies], context.context);
  DataSourceTemplate.createWithContext('TradingContract', [context.trading], context.context);

  return fund;
}

function denominationAsset(context: Context): Asset {
  let accounting = context.contracts.accounting;
  let denominationAsset = accounting.DENOMINATION_ASSET();
  return useAsset(denominationAsset.toHex());
}

function investableAssets(context: Context): Asset[] {
  let participation = context.contracts.participation;
  let assets = context.entities.version.assets;
  let investable: Asset[] = [];
  for (let i: i32 = 0; i < assets.length; i++) {
    if (!participation.investAllowed(Address.fromString(assets[i]))) {
      continue;
    }

    investable.push(useAsset(assets[i]));
  }

  return investable;
}
