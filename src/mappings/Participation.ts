import { investmentEntity } from "./entities/investmentEntity";
import { RequestExecution, ParticipationContract, Redemption, EnableInvestment, DisableInvestment } from "../types/ParticipationFactoryDataSource/templates/ParticipationDataSource/ParticipationContract";
import { Participation } from "../types/schema";
import { HubContract } from "../types/ParticipationFactoryDataSource/templates/ParticipationDataSource/HubContract";
import { AccountingContract } from "../types/ParticipationFactoryDataSource/templates/ParticipationDataSource/AccountingContract";

export function handleRequestExecution(event: RequestExecution): void {
  let contract = ParticipationContract.bind(event.address);
  let fundContract = HubContract.bind(contract.hub());
  let accountingContract = AccountingContract.bind(fundContract.accounting());
  let currentSharePrice = accountingContract.calcSharePrice();

  let investment = investmentEntity(event.params.requestOwner, contract.hub());
  investment.shares = investment.shares.plus(event.params.requestedShares);
  investment.sharePrice = currentSharePrice;
  investment.save();
}

export function handleRedemption(event: Redemption): void {
  let contract = ParticipationContract.bind(event.address);
  let investment = investmentEntity(event.params.redeemer, contract.hub());
  investment.shares = investment.shares.minus(event.params.redeemedShares);
  investment.save();
}

export function handleEnableInvestment(event: EnableInvestment): void {
  let participation = Participation.load(event.address.toHex()) as Participation;
  let enabled = event.params.asset.map<string>((value) => value.toHex())
  participation.allowedAssets = participation.allowedAssets.concat(enabled);
  participation.save();
}

export function handleDisableInvestment(event: DisableInvestment): void {
  let participation = Participation.load(event.address.toHex()) as Participation;
  let disabled = event.params.assets.map<string>(value => value.toHex());
  let allowed = new Array<string>();
  for (let i: i32 = 0; i < participation.allowedAssets.length; i++) {
    let current = (participation.allowedAssets as string[])[i];
    if (disabled.indexOf(current) === -1) {
      allowed = allowed.concat([current]);
    }
  }

  participation.allowedAssets = allowed;
  participation.save();
}