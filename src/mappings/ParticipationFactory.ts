import { NewInstance } from "../codegen/templates/ParticipationFactoryDataSource/ParticipationFactoryContract";
import { ParticipationDataSource } from "../codegen/templates";
import { Participation } from "../codegen/schema";
import { saveContract } from "../utils/saveContract";
import { dataSource } from "@graphprotocol/graph-ts";
import { saveEvent } from "../utils/saveEvent";

export function handleNewInstance(event: NewInstance): void {
  // ignore contracts created before go-live
  if (
    dataSource.network() == "mainnet" &&
    event.block.number.toI32() < 7272207
  ) {
    return;
  }

  saveEvent("NewInstance", event);

  ParticipationDataSource.create(event.params.instance);

  let participation = new Participation(event.params.instance.toHex());
  participation.fund = event.params.hub.toHex();
  participation.allowedAssets = [];
  participation.save();

  saveContract(
    participation.id,
    "Participation",
    "",
    event.block.timestamp,
    event.params.hub.toHex()
  );
}
