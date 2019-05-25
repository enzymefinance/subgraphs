import { FeeManagerDataSource } from "../types/FeeManagerFactoryDataSource/templates";
import { NewInstance } from "../types/FeeManagerFactoryDataSource/FeeManagerFactoryContract";
import { FeeManager } from "../types/schema";
import { saveContract } from "./utils/saveContract";

export function handleNewInstance(event: NewInstance): void {
  FeeManagerDataSource.create(event.params.instance);

  let feeManager = new FeeManager(event.params.instance.toHex());
  feeManager.fund = event.params.hub.toHex();
  feeManager.save();

  saveContract(
    feeManager.id,
    "FeeManager",
    event.block.timestamp,
    event.block.number,
    event.params.hub.toHex()
  );
}
