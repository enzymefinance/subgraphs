import { PolicyManagerDataSource } from "../types/PolicyManagerFactoryDataSource/templates";
import { NewInstance } from "../types/PolicyManagerFactoryDataSource/PolicyManagerFactoryContract";
import { PolicyManager } from "../types/schema";
import { saveContract } from "./utils/saveContract";
import { log, BigInt } from "@graphprotocol/graph-ts";

export function handleNewInstance(event: NewInstance): void {
  // ignore contracts created before go-live
  if (event.block.number.toI32() < 7272209) {
    return;
  }

  PolicyManagerDataSource.create(event.params.instance);

  let policyManager = new PolicyManager(event.params.instance.toHex());
  policyManager.fund = event.params.hub.toHex();
  policyManager.save();

  saveContract(
    policyManager.id,
    "PolicyManager",
    event.block.timestamp,
    event.block.number,
    event.params.hub.toHex()
  );
}
