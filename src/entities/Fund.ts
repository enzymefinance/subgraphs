import { Address, DataSourceTemplate, BigInt, log, ethereum } from '@graphprotocol/graph-ts';
import { hexToAscii } from '../utils/hexToAscii';
import { Fund } from '../generated/schema';
import { Context } from '../context';

export function useFund(id: string): Fund {
  let fund = Fund.load(id);
  if (fund == null) {
    log.critical('Failed to load fund {}.', [id]);
  }

  return fund as Fund;
}

export function maybeFund(id: string): Fund | null {
  return Fund.load(id);
}

export function createFund(event: ethereum.Event, address: Address, context: Context): Fund {
  let fund = new Fund(address.toHex());
  context.entities.fund = fund;

  let participation = context.contracts.participation;
  let assets = context.entities.version.assets;
  let investable: string[] = [];
  for (let i: i32 = 0; i < assets.length; i++) {
    if (participation.investAllowed(Address.fromString(assets[i]))) {
      investable.push(assets[i]);
    }
  }

  fund.name = hexToAscii(context.contracts.hub.name());
  fund.inception = event.block.timestamp;
  fund.version = context.version;
  fund.manager = context.manager;
  fund.active = true;
  fund.shares = BigInt.fromI32(0);
  fund.investable = investable;
  fund.holdings = [];
  fund.save();

  // createFees(fund);

  DataSourceTemplate.createWithContext('HubContract', [context.hub], context.context);
  DataSourceTemplate.createWithContext('AccountingContract', [context.accounting], context.context);
  DataSourceTemplate.createWithContext('FeeManagerContract', [context.fees], context.context);
  DataSourceTemplate.createWithContext('ParticipationContract', [context.participation], context.context);
  DataSourceTemplate.createWithContext('PolicyManagerContract', [context.policies], context.context);
  DataSourceTemplate.createWithContext('SharesContract', [context.shares], context.context);
  DataSourceTemplate.createWithContext('TradingContract', [context.trading], context.context);

  return fund;
}
