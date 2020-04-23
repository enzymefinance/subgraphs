import { Address, DataSourceTemplate } from '@graphprotocol/graph-ts';
import { Fund } from '../generated/schema';
import { HubContract } from '../generated/templates/v2/HubContract/HubContract';
import { hexToAscii } from '../utils/hexToAscii';
import { ensureManager } from './Account';
import { ensureVersion } from './Version';

export function ensureFund(hubAddress: Address): Fund {
  let fund = Fund.load(hubAddress.toHex()) as Fund;
  if (fund) {
    return fund;
  }

  // Start observing the hub contract.
  createFundDataSources(hubAddress);

  let hubContract = HubContract.bind(hubAddress);

  fund = new Fund(hubAddress.toHex());
  fund.version = ensureVersion(hubContract.version()).id;
  fund.name = hexToAscii(hubContract.name());
  fund.active = !hubContract.isShutDown();
  fund.manager = ensureManager(hubContract.manager()).id;
  fund.save();

  return fund;
}

function createFundDataSources(hubAddress: Address): void {
  let hubContract = HubContract.bind(hubAddress);
  let routes = hubContract.routes();

  DataSourceTemplate.create('v2/HubContract', [hubAddress.toHex()]);
  DataSourceTemplate.create('v2/AccountingContract', [routes.value0.toHex()]);
  DataSourceTemplate.create('v2/FeeManagerContract', [routes.value1.toHex()]);
  DataSourceTemplate.create('v2/ParticipationContract', [routes.value2.toHex()]);
  DataSourceTemplate.create('v2/PolicyManagerContract', [routes.value3.toHex()]);
  DataSourceTemplate.create('v2/SharesContract', [routes.value4.toHex()]);
  DataSourceTemplate.create('v2/TradingContract', [routes.value5.toHex()]);
  DataSourceTemplate.create('v2/VaultContract', [routes.value6.toHex()]);
}
