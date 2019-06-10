import { SharesDataSource } from "../types/SharesFactoryDataSource/templates";
import { NewInstance } from "../types/SharesFactoryDataSource/SharesFactoryContract";
import { Share } from "../types/schema";
import { saveContract } from "./utils/saveContract";
import { BigInt } from "@graphprotocol/graph-ts";

export function handleNewInstance(event: NewInstance): void {
  // ignore contracts created before go-live
  if (event.block.number.toI32() < 7272211) {
    return;
  }

  SharesDataSource.create(event.params.instance);

  let shares = new Share(event.params.instance.toHex());
  shares.fund = event.params.hub.toHex();
  shares.save();

  saveContract(
    shares.id,
    "Shares",
    event.block.timestamp,
    event.block.number,
    shares.fund
  );
}
