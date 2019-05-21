import { NewFund } from '../types/VersionDataSource/VersionContract';
import { HubDataSource } from '../types/VersionDataSource/templates';
import { Fund } from '../types/schema';
import { hexToAscii } from './utils/hexToAscii';
import { HubContract } from '../types/VersionDataSource/HubContract';

export function handleNewFund(event: NewFund): void {
  HubDataSource.create(event.params.hub);

  let hub = event.params.hub.toHex();
  let addresses = event.params.routes.map<string>(value => value.toHex());
  let contract = HubContract.bind(event.params.hub);
  let fund = new Fund(hub);
  fund.manager = event.params.manager.toHex();
  fund.name = hexToAscii(contract.name());
  fund.creationTime = contract.creationTime();
  fund.isShutdown = contract.isShutDown();
  fund.accounting = addresses[0];
  fund.feeManager = addresses[1];
  fund.participation = addresses[2];
  fund.policyManager = addresses[3];
  fund.shares = addresses[4];
  fund.trading = addresses[5];
  fund.vault = addresses[6];
  fund.registry = addresses[8];
  fund.version = addresses[9];
  fund.engine = addresses[10];
  fund.save();
}
