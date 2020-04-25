import { Fund } from '../generated/schema';
import { HubContract } from '../generated/HubContract';
import { Address, dataSource } from '@graphprotocol/graph-ts';
import { AccountingContract } from '../generated/AccountingContract';

export function fundAddresses(hub: HubContract): Address {
  if (dataSource.context().getString('branch') == 'A') {
    let accountingContract = AccountingContract.bind(hub.accounting());
    return accountingContract.version();
  }

  return hub.version();
}
