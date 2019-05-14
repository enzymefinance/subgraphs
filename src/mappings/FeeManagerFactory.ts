import { FeeManagerDataSource } from "../types/FeeManagerFactoryDataSource/templates";
import { NewInstance } from "../types/FeeManagerFactoryDataSource/FeeManagerFactoryContract";
import { FeeManager } from "../types/schema";

export function handleNewInstance(event: NewInstance): void {
  FeeManagerDataSource.create(event.params.instance);

  let feeManager = new FeeManager(event.params.instance.toHex());
  feeManager.save();
}
