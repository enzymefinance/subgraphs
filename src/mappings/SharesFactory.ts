import { SharesDataSource } from "../codegen/templates";
import { NewInstance } from "../codegen/templates/SharesFactoryDataSource/SharesFactoryContract";
import { Share } from "../codegen/schema";
import { saveContract } from "../utils/saveContract";
import { dataSource } from "@graphprotocol/graph-ts";
import { saveEvent } from "../utils/saveEvent";

export function handleNewInstance(event: NewInstance): void {
  // ignore contracts created before go-live
  if (
    dataSource.network() == "mainnet" &&
    event.block.number.toI32() < 7272211
  ) {
    return;
  }

  saveEvent("NewInstance", event);

  SharesDataSource.create(event.params.instance);

  let shares = new Share(event.params.instance.toHex());
  shares.fund = event.params.hub.toHex();
  shares.save();

  saveContract(shares.id, "Shares", "", event.block.timestamp, shares.fund);
}
