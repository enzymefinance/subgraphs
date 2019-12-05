import { NewInstance } from "../types/ParticipationFactoryDataSource/ParticipationFactoryContract";
import { ParticipationDataSource } from "../types/templates";
import { Participation } from "../types/schema";
import { saveContract } from "./utils/saveContract";
import { saveEventHistory } from "./utils/saveEventHistory";
import { dataSource } from "@graphprotocol/graph-ts";

export function handleNewInstance(event: NewInstance): void {
  // ignore contracts created before go-live
  if (
    dataSource.network() == "mainnet" &&
    event.block.number.toI32() < 7272207
  ) {
    return;
  }
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

  saveEventHistory(
    event.transaction.hash.toHex(),
    event.block.timestamp,
    event.params.hub.toHex(),
    "ParticipationFactory",
    event.address.toHex(),
    "NewInstance",
    [],
    []
  );
}
