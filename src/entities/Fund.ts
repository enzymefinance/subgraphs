import { Address, DataSourceTemplate, BigInt } from '@graphprotocol/graph-ts';
import { hexToAscii } from '../utils/hexToAscii';
import { Fund, Asset } from '../generated/schema';
import { Context } from '../context';
import { useAsset } from './Asset';
import { createFees } from './Fee';
import { createState, createShares, createPortfolio } from './Tracking';
import { logCritical } from '../utils/logCritical';

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

  let shares = createShares(BigInt.fromI32(0), null, context);
  let portfolio = createPortfolio([], null, context);
  let state = createState(shares, portfolio, context);
  context.entities.state = state;

  fund.name = hexToAscii(context.contracts.hub.name());
  fund.inception = context.event.block.timestamp;
  fund.version = context.version;
  fund.manager = context.manager;
  fund.shares = shares.id;
  fund.portfolio = portfolio.id;
  fund.state = state.id;
  fund.active = true;
  fund.investable = investableAssets(context).map<string>((item) => item.id);
  fund.save();

  createFees(context);

  DataSourceTemplate.createWithContext('HubContract', [context.hub], context.context);
  DataSourceTemplate.createWithContext('AccountingContract', [context.accounting], context.context);
  DataSourceTemplate.createWithContext('FeeManagerContract', [context.fees], context.context);
  DataSourceTemplate.createWithContext('ParticipationContract', [context.participation], context.context);
  DataSourceTemplate.createWithContext('PolicyManagerContract', [context.policies], context.context);
  DataSourceTemplate.createWithContext('TradingContract', [context.trading], context.context);

  return fund;
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
