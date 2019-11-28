import { PolicyManagerDataSource } from "../types/templates";
import { NewInstance } from "../types/PolicyManagerFactoryDataSource/PolicyManagerFactoryContract";
import { PolicyManager } from "../types/schema";
import { saveContract } from "./utils/saveContract";
import { saveEventHistory } from "./utils/saveEventHistory";

export function handleNewInstance(event: NewInstance): void {
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

  saveEventHistory(
    event.transaction.hash.toHex(),
    event.block.timestamp,
    event.params.hub.toHex(),
    "PolicyManagerFactory",
    event.address.toHex(),
    "NewInstance",
    [],
    []
  );
}
