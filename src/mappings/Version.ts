import { NewFund } from '../types/VersionDataSource/VersionContract';
import { HubDataSource } from '../types/VersionDataSource/templates';
import { Fund, Routes } from '../types/schema';
import { hexToAscii } from './utils/hexToAscii';
import { HubContract } from '../types/VersionDataSource/HubContract';

export function handleNewFund(event: NewFund): void {
  HubDataSource.create(event.params.hub);

  let hub = event.params.hub.toHex();
  let addresses = event.params.routes.map<string>(value => value.toHex());
  let routes = new Routes(hub);
  routes.accounting = addresses[0];
  routes.feeManager = addresses[1];
  routes.participation = addresses[2];
  routes.policyManager = addresses[3];
  routes.shares = addresses[4];
  routes.trading = addresses[5];
  routes.vault = addresses[6];
  routes.priceSource = addresses[7];
  routes.registry = addresses[8];
  routes.version = addresses[9];
  routes.engine = addresses[10];
  routes.mlnToken = addresses[11];
  routes.save();

  let contract = HubContract.bind(event.params.hub);
  let fund = new Fund(hub);
  fund.routes = hub;
  fund.manager = event.params.manager.toHex();
  fund.name = hexToAscii(contract.name());
  fund.creationTime = contract.creationTime();
  fund.isShutdown = contract.isShutDown();
  fund.save();
}
