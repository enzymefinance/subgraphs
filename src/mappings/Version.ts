import { Universe, Fund, Routes } from '../types/schema'
import { Hub } from '../types/Version/templates';
import { Hub as HubContract } from '../types/Version/templates/Hub/Hub';
import { NewFund } from '../types/Version/Version';
import { Address, Value } from '@graphprotocol/graph-ts';

function hexToAscii(hex: string): string {
  let output = '';
  for (let i = 0; i < hex.length; i += 2) {
    let slice = parseInt(hex.substr(i, 2), 16) as i32;

    if (slice) {
      output += String.fromCharCode(slice);
    }
  }

  return output;
}

export function handleNewFund(event: NewFund): void {
  let version = event.address.toHexString();

  // Start watching the newly created Hub.
  Hub.create(event.params.hub);

  // Update the fund factory entity.
  let universe = Universe.load(version);
  if (!universe){
    universe = new Universe(version);
    universe.count = 0;
  }

  universe.count = universe.count + 1;
  universe.save();

  // Create and populate the fund entity.
  let contract = HubContract.bind(event.params.hub);
  let address = event.params.hub.toHexString();
  let routes = new Routes(address);

  // TODO: How to read these values directly from the event array.
  let routesMap = contract.routes();
  routes.accounting = routesMap.value0.toHexString();
  routes.feeManager = routesMap.value1.toHexString();
  routes.participation = routesMap.value2.toHexString();
  routes.policyManager = routesMap.value3.toHexString();
  routes.shares = routesMap.value4.toHexString();
  routes.trading = routesMap.value5.toHexString();
  routes.vault = routesMap.value6.toHexString();
  routes.priceSource = routesMap.value7.toHexString();
  routes.registry = routesMap.value8.toHexString();
  routes.version = routesMap.value9.toHexString();
  routes.engine = routesMap.value10.toHexString();
  routes.mlnToken = routesMap.value11.toHexString();
  routes.save();

  let fund = new Fund(address);
  fund.version = version;
  fund.routes = routes.id;
  fund.name = hexToAscii(contract.name());
  fund.creationTime = contract.creationTime();
  fund.isShutdown = contract.isShutDown();
  fund.manager = contract.manager().toHexString();
  fund.creator = contract.creator().toHexString();
  fund.save();
}
