import { Address } from "@graphprotocol/graph-ts";
import { Fund } from "../../types/schema";
import { HubDataSource } from "../../types/VersionDataSource/templates";
import { HubContract } from "../../types/VersionDataSource/templates/HubDataSource/HubContract";
import { hexToAscii } from "../utils/hexToAscii";
import { routesEntity } from "./routesEntity";

export function fundEntity(address: Address): Fund {
  let id = address.toHex();
  let fund = Fund.load(id);

  if (fund === null) {
    HubDataSource.create(address);

    let contract = HubContract.bind(address);
    fund = new Fund(id);
    fund.routes = routesEntity(address).id;
    fund.name = hexToAscii(contract.name());
    fund.creationTime = contract.creationTime();
    fund.isShutdown = contract.isShutDown();
    fund.manager = contract.manager().toHexString();
    fund.save();
  }

  return fund as Fund;
}