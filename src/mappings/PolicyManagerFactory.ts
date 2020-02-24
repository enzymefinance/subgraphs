import { PolicyManagerDataSource } from "../codegen/templates";
import { NewInstance } from "../codegen/templates/PolicyManagerFactoryDataSource/PolicyManagerFactoryContract";
import { PolicyManager } from "../codegen/schema";
import { saveContract } from "../utils/saveContract";
import { dataSource } from "@graphprotocol/graph-ts";
import { saveEvent } from "../utils/saveEvent";

export function handleNewInstance(event: NewInstance): void {
  // ignore contracts created before go-live
  if (
    dataSource.network() == "mainnet" &&
    event.block.number.toI32() < 7272209
  ) {
    return;
  }

  saveEvent("NewInstance", event);

  PolicyManagerDataSource.create(event.params.instance);

  let policyManager = new PolicyManager(event.params.instance.toHex());
  policyManager.fund = event.params.hub.toHex();
  policyManager.save();

  saveContract(
    policyManager.id,
    "PolicyManager",
    "",
    event.block.timestamp,
    event.params.hub.toHex()
  );
}
