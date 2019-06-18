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
  InvestmentHistory,
  FundCalculationsHistory,
  FundHoldingsHistory
} from "../types/schema";
import { HubContract } from "../types/ParticipationFactoryDataSource/templates/ParticipationDataSource/HubContract";
import { AccountingContract } from "../types/ParticipationFactoryDataSource/templates/ParticipationDataSource/AccountingContract";
import { SharesContract } from "../types/ParticipationFactoryDataSource/templates/ParticipationDataSource/SharesContract";

import { currentState } from "./utils/currentState";
import { BigInt } from "@graphprotocol/graph-ts";
import { PriceSourceContract } from "../types/ParticipationFactoryDataSource/templates/ParticipationDataSource/PriceSourceContract";

export function handleRequestExecution(event: RequestExecution): void {
  let participationContract = ParticipationContract.bind(event.address);
  let hub = participationContract.hub();
  let routes = participationContract.routes();

  let fundContract = HubContract.bind(hub);
  let accountingContract = AccountingContract.bind(fundContract.accounting());
  let currentSharePrice = accountingContract.calcSharePrice();
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
    participationContract.hub(),
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
    event.params.requestOwner.toHex() +
    "/" +
    participationContract.hub().toHex();
  investmentHistory.owner = event.params.requestOwner.toHex();
  investmentHistory.fund = participationContract.hub().toHex();
  investmentHistory.action = "Investment";
  investmentHistory.shares = requestedShares;
  investmentHistory.sharePrice = currentSharePrice;
  investmentHistory.amount = investmentAmount;
  investmentHistory.asset = investmentAsset.toHex();
  investmentHistory.amountInDenominationAsset = amountInDenomationAsset;
  investmentHistory.save();

  // calculate fund holdings

  let fundAddress = hub.toHex();

  let fundGavValid = true;
  let holdings = accountingContract.getFundHoldings();

  let priceSourceContract = PriceSourceContract.bind(routes.value7);
  for (let k: i32 = 0; k < holdings.value0.length; k++) {
    let holdingAmount = holdings.value0[k];
    let holdingAddress = holdings.value1[k];

    let holdingsId =
      fundAddress +
      "/" +
      event.block.timestamp.toString() +
      "/" +
      holdingAddress.toHex();
    let fundHoldingsHistory = new FundHoldingsHistory(holdingsId);
    fundHoldingsHistory.timestamp = event.block.timestamp;
    fundHoldingsHistory.fund = fundAddress;
    fundHoldingsHistory.asset = holdingAddress.toHex();
    fundHoldingsHistory.amount = holdingAmount;

    fundHoldingsHistory.validPrice = priceSourceContract.hasValidPrice(
      holdingAddress
    );
    if (fundHoldingsHistory.validPrice) {
      fundHoldingsHistory.assetGav = accountingContract.calcAssetGAV(
        holdingAddress
      );
    } else {
      fundGavValid = false;
    }

    // only save non-zero values
    if (!holdingAmount.isZero()) {
      fundHoldingsHistory.save();
    }
  }

  // do perform calculations
  if (!fundGavValid) {
    return;
  }

  let calcs = accountingContract.performCalculations();
  let fundGav = calcs.value0;
  let feesInDenomiationAsset = calcs.value1;
  let feesInShares = calcs.value2;
  let nav = calcs.value3;
  let sharePrice = calcs.value4;
  let gavPerShareNetManagementFee = calcs.value5;

  // save price calculation to history
  let calculationsId = fundAddress + "/" + event.block.timestamp.toString();
  let calculations = new FundCalculationsHistory(calculationsId);
  calculations.fund = fundAddress;
  calculations.timestamp = event.block.timestamp;
  calculations.gav = fundGav;
  calculations.validPrices = fundGavValid;
  calculations.feesInDenominationAsset = feesInDenomiationAsset;
  calculations.feesInShares = feesInShares;
  calculations.nav = nav;
  calculations.sharePrice = sharePrice;
  calculations.gavPerShareNetManagementFee = gavPerShareNetManagementFee;
  calculations.totalSupply = totalSupply;
  calculations.save();
}

export function handleRedemption(event: Redemption): void {
  let participationContract = ParticipationContract.bind(event.address);
  let hub = participationContract.hub();
  let routes = participationContract.routes();

  let fundContract = HubContract.bind(participationContract.hub());
  let accountingContract = AccountingContract.bind(fundContract.accounting());
  let currentSharePrice = accountingContract.calcSharePrice();
  let defaultSharePrice = accountingContract.DEFAULT_SHARE_PRICE();
  let asset = accountingContract.NATIVE_ASSET();

  let sharesContract = SharesContract.bind(fundContract.shares());
  let totalSupply = sharesContract.totalSupply();

  let amount = currentSharePrice
    .times(event.params.redeemedShares)
    .div(defaultSharePrice);

  let investment = investmentEntity(
    event.params.redeemer,
    participationContract.hub(),
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
    event.params.redeemer.toHex() + "/" + participationContract.hub().toHex();
  investmentHistory.owner = event.params.redeemer.toHex();
  investmentHistory.fund = participationContract.hub().toHex();
  investmentHistory.action = "Redemption";
  investmentHistory.shares = event.params.redeemedShares;
  investmentHistory.sharePrice = currentSharePrice;
  investmentHistory.amount = amount;
  investmentHistory.asset = asset.toHex();
  investmentHistory.amountInDenominationAsset = amount;
  investmentHistory.save();

  // calculate fund holdings

  let fundAddress = hub.toHex();

  let fundGavValid = true;
  let holdings = accountingContract.getFundHoldings();

  let priceSourceContract = PriceSourceContract.bind(routes.value7);
  for (let k: i32 = 0; k < holdings.value0.length; k++) {
    let holdingAmount = holdings.value0[k];
    let holdingAddress = holdings.value1[k];

    let holdingsId =
      fundAddress +
      "/" +
      event.block.timestamp.toString() +
      "/" +
      holdingAddress.toHex();
    let fundHoldingsHistory = new FundHoldingsHistory(holdingsId);
    fundHoldingsHistory.timestamp = event.block.timestamp;
    fundHoldingsHistory.fund = fundAddress;
    fundHoldingsHistory.asset = holdingAddress.toHex();
    fundHoldingsHistory.amount = holdingAmount;

    fundHoldingsHistory.validPrice = priceSourceContract.hasValidPrice(
      holdingAddress
    );
    if (fundHoldingsHistory.validPrice) {
      fundHoldingsHistory.assetGav = accountingContract.calcAssetGAV(
        holdingAddress
      );
    } else {
      fundGavValid = false;
    }

    // only save non-zero values
    if (!holdingAmount.isZero()) {
      fundHoldingsHistory.save();
    }
  }

  // do perform calculations
  if (!fundGavValid) {
    return;
  }

  let calcs = accountingContract.performCalculations();
  let fundGav = calcs.value0;
  let feesInDenomiationAsset = calcs.value1;
  let feesInShares = calcs.value2;
  let nav = calcs.value3;
  let sharePrice = calcs.value4;
  let gavPerShareNetManagementFee = calcs.value5;

  // save price calculation to history
  let calculationsId = fundAddress + "/" + event.block.timestamp.toString();
  let calculations = new FundCalculationsHistory(calculationsId);
  calculations.fund = fundAddress;
  calculations.timestamp = event.block.timestamp;
  calculations.gav = fundGav;
  calculations.validPrices = fundGavValid;
  calculations.feesInDenominationAsset = feesInDenomiationAsset;
  calculations.feesInShares = feesInShares;
  calculations.nav = nav;
  calculations.sharePrice = sharePrice;
  calculations.gavPerShareNetManagementFee = gavPerShareNetManagementFee;
  calculations.totalSupply = totalSupply;
  calculations.save();
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
