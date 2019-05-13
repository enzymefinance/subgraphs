import { ParticipationDataSource } from "../../types/VersionDataSource/templates";
import { Participation } from "../../types/schema";
import { Address } from "@graphprotocol/graph-ts";
import { ParticipationContract } from "../../types/VersionDataSource/templates/ParticipationDataSource/ParticipationContract";
import { fundEntity } from "./fundEntity";

export function participationEntity(address: Address): Participation {
  let id = address.toHex();
  let participation = Participation.load(id);

  if (!participation) { 
    ParticipationDataSource.create(address);

    let contract = ParticipationContract.bind(address);
    participation = new Participation(id);
    participation.fund = contract.hub().toHex();
    participation.allowedAssets = [];
    participation.investmentRequests = [];
    participation.save();
  }

  return participation as Participation;
}