import { RequestExecution, Redemption, EnableInvestment, DisableInvestment, ParticipationContract } from "../types/VersionDataSource/templates/ParticipationDataSource/ParticipationContract";
import { participationEntity } from "./entities/participationEntity";
import { assetEntity } from "./entities/assetEntity";
import { investmentEntity } from "./entities/investmentEntity";

export function handleRequestExecution(event: RequestExecution): void {
  let contract = ParticipationContract.bind(event.address);
  let investment = investmentEntity(event.params.requestOwner, contract.hub());
  investment.shares = investment.shares.plus(event.params.requestedShares);
  investment.save();
}

export function handleRedemption(event: Redemption): void {
  let contract = ParticipationContract.bind(event.address);
  let investment = investmentEntity(event.params.redeemer, contract.hub());
  investment.shares = investment.shares.minus(event.params.redeemedShares);
  investment.save();
}

export function handleEnableInvestment(event: EnableInvestment): void {
  let participation = participationEntity(event.address);
  let enabled = event.params.asset.map<string>((value) => assetEntity(value).id)

  participation.allowedAssets = participation.allowedAssets.concat(enabled);
  participation.save();
}

export function handleDisableInvestment(event: DisableInvestment): void {
  let participation = participationEntity(event.address);
  let disabled = event.params.assets.map<string>(value => value.toHexString());

  let allowed = new Array<string>();
  for (let i: i32 = 0; i < participation.allowedAssets.length; i++) {
    let current = (participation.allowedAssets as string[])[i];
    if (disabled.indexOf(current) === -1) {
      allowed.push(current);
    }
  }

  participation.allowedAssets = allowed;
  participation.save();
}