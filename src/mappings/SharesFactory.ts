import { SharesDataSource } from "../types/templates";
import { NewInstance } from "../types/templates/SharesFactoryDataSource/SharesFactoryContract";
import { Share } from "../types/schema";
import { saveContract } from "./utils/saveContract";
import { BigInt, dataSource } from "@graphprotocol/graph-ts";
import { saveEventHistory } from "./utils/saveEventHistory";

export function handleNewInstance(event: NewInstance): void {
  // ignore contracts created before go-live
  if (
    dataSource.network() == "mainnet" &&
    event.block.number.toI32() < 7272211
  ) {
    return;
  }
  SharesDataSource.create(event.params.instance);

  let shares = new Share(event.params.instance.toHex());
  shares.fund = event.params.hub.toHex();
  shares.save();

  saveContract(shares.id, "Shares", "", event.block.timestamp, shares.fund);

  saveEventHistory(
    event.transaction.hash.toHex(),
    event.block.timestamp,
    event.params.hub.toHex(),
    "SharesFactory",
    event.address.toHex(),
    "NewInstance",
    [],
    []
  );
}
