import { Routes } from "../../types/schema";
import { HubContract } from "../../types/VersionDataSource/templates/HubDataSource/HubContract";
import { Address } from "@graphprotocol/graph-ts";
import { accountingEntity } from "./accountingEntity";
import { participationEntity } from "./participationEntity";

export function routesEntity(address: Address): Routes {
  let id = address.toHex();
  let routes = Routes.load(id);

  if (routes === null) {
    let contract = HubContract.bind(address);
    routes = new Routes(id);
    routes.accounting = accountingEntity(contract.accounting()).id;
    routes.participation = participationEntity(contract.participation()).id;
    routes.policyManager = contract.policyManager().toHex();
    routes.shares = contract.shares().toHex();
    routes.trading = contract.trading().toHex();
    routes.vault = contract.vault().toHex();
    routes.priceSource = contract.priceSource().toHex();
    routes.registry = contract.registry().toHex();
    routes.version = contract.version().toHex();
    
    // TODO: Some routes don't have explicit calls.
    // TODO: How to read these values directly from the event array.
    let routesMap = contract.routes();
    routes.feeManager = routesMap.value1.toHex();
    routes.engine = routesMap.value10.toHex();
    routes.mlnToken = routesMap.value11.toHex();
    routes.save();
  }

  return routes as Routes;
}
