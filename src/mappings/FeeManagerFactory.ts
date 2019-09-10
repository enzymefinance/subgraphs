import { FeeManagerDataSource } from "../types/templates";
import {
  NewInstance,
  CreateInstanceCall
} from "../types/FeeManagerFactoryDataSource/FeeManagerFactoryContract";
import { FeeManager } from "../types/schema";
import { saveContract } from "./utils/saveContract";
import { BigInt } from "@graphprotocol/graph-ts";
import { saveEventHistory } from "./utils/saveEventHistory";

export function handleNewInstance(event: NewInstance): void {
  // ignore contracts created before go-live
  if (event.block.number.toI32() < 7272205) {
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

  saveEventHistory(
    event.transaction.hash.toHex(),
    event.block.timestamp,
    event.params.hub.toHex(),
    "FeeManagerFactory",
    event.address.toHex(),
    "NewInstance",
    [],
    []
  );
}
