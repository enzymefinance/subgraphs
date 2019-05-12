import { ParticipationDataSource } from "../../types/VersionDataSource/templates";
import { Participation } from "../../types/schema";
import { Address } from "@graphprotocol/graph-ts";

export function participationEntity(address: Address): Participation {
  let id = address.toHex();
  let participation = Participation.load(id);

  if (participation === null) { 
    ParticipationDataSource.create(address);

    participation = new Participation(id);
    participation.allowedAssets = [];
    participation.investmentRequests = [];
    participation.save();
  }

  return participation as Participation;
}