import { PolicyManagerDataSource } from "../types/PolicyManagerFactoryDataSource/templates";
import { NewInstance } from "../types/PolicyManagerFactoryDataSource/PolicyManagerFactoryContract";
import { PolicyManager } from "../types/schema";

export function handleNewInstance(event: NewInstance): void {
  PolicyManagerDataSource.create(event.params.instance);

  let policyManager = new PolicyManager(event.params.instance.toHex());
  policyManager.save();
}
