import { Address, DataSourceTemplate } from '@graphprotocol/graph-ts';
import { Fund } from '../generated/schema';
import { HubContract } from '../generated/templates/v2/HubContract/HubContract';

export function ensureFund(hubAddress: Address): Fund {
  let fund = Fund.load(hubAddress.toHex()) as Fund;
  if (fund) {
    return fund;
  }

  // Start observing the hub contract.
  createFundDataSources(hubAddress);

  let hubContract = HubContract.bind(hubAddress);

  fund = new Fund(hubAddress.toHex());
  fund.version = hubContract.version().toHex();
  fund.active = !hubContract.isShutDown();
  fund.save();

  return fund;
}

function createFundDataSources(hubAddress: Address): void {
  DataSourceTemplate.create('v2/HubContract', [hubAddress.toHex()]);
}
