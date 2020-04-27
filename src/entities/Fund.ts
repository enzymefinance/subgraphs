import { Address, DataSourceTemplate, BigInt, log, ethereum } from '@graphprotocol/graph-ts';
import { hexToAscii } from '../utils/hexToAscii';
import { Fund, FundHolding, Asset } from '../generated/schema';
import { Context } from '../context';
import { createFundHolding } from './Holding';
import { useAsset } from './Asset';
import { createFees } from './Fee';

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

  fund.name = hexToAscii(context.contracts.hub.name());
  fund.inception = event.block.timestamp;
  fund.version = context.version;
  fund.manager = context.manager;
  fund.active = true;
  fund.shares = BigInt.fromI32(0);
  fund.investable = investableAssets(context).map<string>((item) => item.id);
  fund.holdings = currentFundHoldings(event, context).map<string>((item) => item.id);
  fund.save();

  createFees(context);

  DataSourceTemplate.createWithContext('HubContract', [context.hub], context.context);
  DataSourceTemplate.createWithContext('AccountingContract', [context.accounting], context.context);
  DataSourceTemplate.createWithContext('FeeManagerContract', [context.fees], context.context);
  DataSourceTemplate.createWithContext('ParticipationContract', [context.participation], context.context);
  DataSourceTemplate.createWithContext('PolicyManagerContract', [context.policies], context.context);
  DataSourceTemplate.createWithContext('SharesContract', [context.shares], context.context);
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

export function currentFundHoldings(event: ethereum.Event, context: Context): FundHolding[] {
  let result = context.contracts.accounting.getFundHoldings();
  let quantities = result.value0;
  let addresses = result.value1;

  log.debug('holdings length ' + BigInt.fromI32(addresses.length).toString(), []);

  let holdings: FundHolding[] = [];
  for (let i: i32 = 0; i < addresses.length; i++) {
    if (quantities[i].isZero()) {
      continue;
    }

    let asset = useAsset(addresses[i].toHex());
    holdings.push(createFundHolding(event, asset, quantities[i], context));
  }

  return holdings;
}

export function updateFundHoldings(event: ethereum.Event, context: Context): Fund {
  let fund = context.entities.fund;
  fund.holdings = currentFundHoldings(event, context).map<string>((item) => item.id);
  fund.save();

  // TODO: Write historical fund metrics.

  return fund;
}
