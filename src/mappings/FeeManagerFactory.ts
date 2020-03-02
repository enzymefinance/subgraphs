import { FeeManagerDataSource } from "../codegen/templates";
import { NewInstance } from "../codegen/templates/FeeManagerFactoryDataSource/FeeManagerFactoryContract";
import { FeeManager } from "../codegen/schema";
import { saveContract } from "../utils/saveContract";
import { BigInt, dataSource } from "@graphprotocol/graph-ts";
import { saveEvent } from "../utils/saveEvent";

export function handleNewInstance(event: NewInstance): void {
  saveEvent("NewInstance", event);

  // ignore contracts created before go-live
  if (
    dataSource.network() == "mainnet" &&
    event.block.number.toI32() < 7272205
  ) {
    return;
  }

  FeeManagerDataSource.create(event.params.instance);

  let feeManager = new FeeManager(event.params.instance.toHex());
  feeManager.fund = event.params.hub.toHex();
  feeManager.feesRegistered = BigInt.fromI32(0);
  feeManager.totalFeeReward = BigInt.fromI32(0);
  feeManager.save();

  saveContract(
    feeManager.id,
    "FeeManager",
    "",
    event.block.timestamp,
    event.params.hub.toHex()
  );
}
