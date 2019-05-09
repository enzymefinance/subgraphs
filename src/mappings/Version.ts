import { Fund, Routes } from '../types/schema'
import { Hub, Participation } from '../types/Version/templates';
import { Hub as HubContract } from '../types/Version/templates/Hub/Hub';
import { NewFund } from '../types/Version/Version';

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
  let contract = HubContract.bind(event.params.hub);

  // Start watching the newly created Hub.
  Hub.create(event.params.hub);
  Participation.create(contract.participation());

  // Create and populate the fund entity.
  let address = event.params.hub.toHexString();
  let routes = new Routes(address);

  routes.accounting = contract.accounting().toHexString();
  routes.participation = contract.participation().toHexString();
  routes.policyManager = contract.policyManager().toHexString();
  routes.shares = contract.shares().toHexString();
  routes.trading = contract.trading().toHexString();
  routes.vault = contract.vault().toHexString();
  routes.priceSource = contract.priceSource().toHexString();
  routes.registry = contract.registry().toHexString();
  routes.version = contract.version().toHexString();
  
  // TODO: Some routes don't have explicit calls.
  // TODO: How to read these values directly from the event array.
  let routesMap = contract.routes();
  routes.feeManager = routesMap.value1.toHexString();
  routes.engine = routesMap.value10.toHexString();
  routes.mlnToken = routesMap.value11.toHexString();
  routes.save();

  let fund = new Fund(address);
  fund.routes = routes.id;
  fund.name = hexToAscii(contract.name());
  fund.creationTime = contract.creationTime();
  fund.isShutdown = contract.isShutDown();
  fund.manager = contract.manager().toHexString();
  fund.save();
}
