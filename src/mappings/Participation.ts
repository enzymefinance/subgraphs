import { investmentEntity } from "./entities/investmentEntity";
import {
  RequestExecution,
  ParticipationContract,
  Redemption,
  EnableInvestment,
  DisableInvestment
} from "../types/ParticipationFactoryDataSource/templates/ParticipationDataSource/ParticipationContract";
import {
  Participation,
  Fund,
  InvestorCount,
  InvestmentHistory
} from "../types/schema";
import { HubContract } from "../types/ParticipationFactoryDataSource/templates/ParticipationDataSource/HubContract";
import { AccountingContract } from "../types/ParticipationFactoryDataSource/templates/ParticipationDataSource/AccountingContract";
import { SharesContract } from "../types/ParticipationFactoryDataSource/templates/ParticipationDataSource/SharesContract";

import { currentState } from "./utils/currentState";
import { BigInt } from "@graphprotocol/graph-ts";

export function handleRequestExecution(event: RequestExecution): void {
  let contract = ParticipationContract.bind(event.address);

  // may come from funds not stored (e.g. because they are deployed with an older version contract?)
  if (!Fund.load(contract.hub().toHex())) {
    return;
  }

  let fundContract = HubContract.bind(contract.hub());
  let accountingContract = AccountingContract.bind(fundContract.accounting());
  let currentSharePrice = accountingContract.calcSharePrice();
  let defaultSharePrice = accountingContract.DEFAULT_SHARE_PRICE();
  let gav = accountingContract.calcGav();

  let sharesContract = SharesContract.bind(fundContract.shares());
  let totalSupply = sharesContract.totalSupply();

  let requestedShares = event.params.requestedShares;
  let investmentAmount = event.params.investmentAmount;
  let investmentAsset = event.params.investmentAsset;

  let amountInDenomationAsset = gav
    .times(event.params.requestedShares)
    .div(totalSupply);

  let investment = investmentEntity(
    event.params.requestOwner,
    contract.hub(),
    event.block.timestamp
  );
  investment.shares = investment.shares.plus(requestedShares);
  investment.sharePrice = currentSharePrice;
  investment.save();

  // this is currently investment-count, not investor-count (misnamed entity)
  // TODO: have both investment-count and investor-count
  let state = currentState();
  let investorCount = new InvestorCount(event.transaction.hash.toHex());
  investorCount.numberOfInvestors = state.numberOfInvestors.plus(
    BigInt.fromI32(1)
  );
  investorCount.timestamp = event.block.timestamp;
  investorCount.save();

  state.numberOfInvestors = investorCount.numberOfInvestors;
  state.timestamptNumberOfInvestors = investorCount.timestamp;
  state.save();

  let investmentHistory = new InvestmentHistory(event.transaction.hash.toHex());
  investmentHistory.timestamp = event.block.timestamp;
  investmentHistory.investment =
    event.params.requestOwner.toHex() + "/" + contract.hub().toHex();
  investmentHistory.owner = event.params.requestOwner.toHex();
  investmentHistory.fund = contract.hub().toHex();
  investmentHistory.action = "Investment";
  investmentHistory.shares = requestedShares;
  investmentHistory.sharePrice = currentSharePrice;
  investmentHistory.amount = investmentAmount;
  investmentHistory.asset = investmentAsset.toHex();
  investmentHistory.amountInDenominationAsset = amountInDenomationAsset;
  investmentHistory.save();
}

export function handleRedemption(event: Redemption): void {
  let contract = ParticipationContract.bind(event.address);

  // may come from funds not stored (e.g. because they are deployed with an older version contract?)
  if (!Fund.load(contract.hub().toHex())) {
    return;
  }

  let fundContract = HubContract.bind(contract.hub());
  let accountingContract = AccountingContract.bind(fundContract.accounting());
  let currentSharePrice = accountingContract.calcSharePrice();
  let defaultSharePrice = accountingContract.DEFAULT_SHARE_PRICE();
  let asset = accountingContract.NATIVE_ASSET();

  let amount = currentSharePrice
    .times(event.params.redeemedShares)
    .div(defaultSharePrice);

  let investment = investmentEntity(
    event.params.redeemer,
    contract.hub(),
    event.block.timestamp
  );
  investment.shares = investment.shares.minus(event.params.redeemedShares);
  investment.save();

  // this is currently investment-count, not investor-count (misnamed entity)
  // TODO: have both investment-count and investor-count
  if (investment.shares.gt(BigInt.fromI32(0))) {
    let state = currentState();
    let investorCount = new InvestorCount(event.transaction.hash.toHex());
    investorCount.numberOfInvestors = state.numberOfInvestors.minus(
      BigInt.fromI32(1)
    );
    investorCount.timestamp = event.block.timestamp;
    investorCount.save();

    state.numberOfInvestors = investorCount.numberOfInvestors;
    state.timestamptNumberOfInvestors = investorCount.timestamp;
    state.save();
  }

  let investmentHistory = new InvestmentHistory(event.transaction.hash.toHex());
  investmentHistory.timestamp = event.block.timestamp;
  investmentHistory.investment =
    event.params.redeemer.toHex() + "/" + contract.hub().toHex();
  investmentHistory.owner = event.params.redeemer.toHex();
  investmentHistory.fund = contract.hub().toHex();
  investmentHistory.action = "Redemption";
  investmentHistory.shares = event.params.redeemedShares;
  investmentHistory.sharePrice = currentSharePrice;
  investmentHistory.amount = amount;
  investmentHistory.asset = asset.toHex();
  investmentHistory.amountInDenominationAsset = amount;
  investmentHistory.save();
}

export function handleEnableInvestment(event: EnableInvestment): void {
  let participation = Participation.load(
    event.address.toHex()
  ) as Participation;
  let enabled = event.params.asset.map<string>(value => value.toHex());
  participation.allowedAssets = participation.allowedAssets.concat(enabled);
  participation.save();
}

export function handleDisableInvestment(event: DisableInvestment): void {
  let participation = Participation.load(
    event.address.toHex()
  ) as Participation;
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
