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
  }

  return routes as Routes;
}
