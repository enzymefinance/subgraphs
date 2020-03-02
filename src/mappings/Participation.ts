import { investmentEntity } from "../entities/investmentEntity";
import {
  RequestExecution,
  ParticipationContract,
  Redemption,
  EnableInvestment,
  DisableInvestment,
  InvestmentRequest,
  CancelRequest
} from "../codegen/templates/ParticipationDataSource/ParticipationContract";
import {
  Participation,
  Fund,
  InvestorCount,
  InvestmentHistory,
  InvestmentRequest as InvestmentRequestEntity,
  FundCalculationsHistory,
  FundHoldingsHistory,
  InvestmentValuationHistory
} from "../codegen/schema";
import {
  AccountingContract,
  AccountingContract__performCalculationsResult
} from "../codegen/templates/ParticipationDataSource/AccountingContract";
import { SharesContract } from "../codegen/templates/ParticipationDataSource/SharesContract";

import { currentState } from "../utils/currentState";
import { store, BigInt, Address } from "@graphprotocol/graph-ts";
import { RegistryContract } from "../codegen/templates/ParticipationDataSource/RegistryContract";
import { PriceSourceContract } from "../codegen/templates/ParticipationDataSource/PriceSourceContract";
import { investorEntity } from "../entities/investorEntity";
import { saveEvent } from "../utils/saveEvent";
import { emptyCalcsObject } from "../utils/emptyCalcsObject";
import { tenToThePowerOf } from "../utils/tenToThePowerOf";
import { investorValuationHistoryEntity } from "../entities/investorValuationHistoryEntity";

function archiveInvestmentRequest(
  owner: string,
  hub: string,
  status: string,
  updateTimestamp: BigInt
): void {
  let id = owner + "/" + hub;
  let investmentRequest = InvestmentRequestEntity.load(id);
  if (investmentRequest != null && investmentRequest.status == "PENDING") {
    let copyRequest = new InvestmentRequestEntity(
      id + "/" + investmentRequest.requestTimestamp.toString()
    );
    copyRequest.fund = investmentRequest.fund;
    copyRequest.owner = investmentRequest.owner;
    copyRequest.shares = investmentRequest.shares;
    copyRequest.amount = investmentRequest.amount;
    copyRequest.asset = investmentRequest.asset;
    copyRequest.requestTimestamp = investmentRequest.requestTimestamp;
    copyRequest.updateTimestamp = updateTimestamp;
    copyRequest.status = status;
    copyRequest.save();

    store.remove("InvestmentRequest", id);
  }
}

export function handleInvestmentRequest(event: InvestmentRequest): void {
  saveEvent("InvestmentRequest", event);

  let participationContract = ParticipationContract.bind(event.address);
  let hub = participationContract.hub();

  let requestOwner = event.params.requestOwner;
  let requestedShares = event.params.requestedShares;
  let investmentAmount = event.params.investmentAmount;
  let investmentAsset = event.params.investmentAsset.toHex();

  // requests can either be pending, cancelled or executed,
  // so, this should not happen, just keeping it for as a test
  archiveInvestmentRequest(
    requestOwner.toHex(),
    hub.toHex(),
    "ARCHIVED",
    event.block.timestamp
  );

  let investmentRequest = new InvestmentRequestEntity(
    requestOwner.toHex() + "/" + hub.toHex()
  );
  investmentRequest.fund = hub.toHex();
  investmentRequest.owner = investorEntity(
    requestOwner.toHex(),
    event.block.timestamp
  ).id;
  investmentRequest.shares = requestedShares;
  investmentRequest.amount = investmentAmount;
  investmentRequest.asset = investmentAsset;
  investmentRequest.requestTimestamp = event.block.timestamp;
  investmentRequest.status = "PENDING";
  investmentRequest.save();
}

export function handleCancelRequest(event: CancelRequest): void {
  saveEvent("CancelRequest", event);

  let participationContract = ParticipationContract.bind(event.address);
  let hub = participationContract.hub();

  archiveInvestmentRequest(
    event.params.requestOwner.toHex(),
    hub.toHex(),
    "CANCELLED",
    event.block.timestamp
  );
}

export function handleRequestExecution(event: RequestExecution): void {
  saveEvent("RequestExecution", event);

  let participation = Participation.load(event.address.toHex());
  if (!participation || !participation.fund) {
    return;
  }
  let fund = Fund.load(participation.fund);
  if (!fund) {
    return;
  }

  let hub = fund.id;

  let accountingContract = AccountingContract.bind(
    Address.fromString(fund.accounting)
  );
  let sharesContract = SharesContract.bind(Address.fromString(fund.share));
  let totalSupply = sharesContract.totalSupply();
  let gav = BigInt.fromI32(0);
  if (!accountingContract.try_calcGav().reverted) {
    gav = accountingContract.try_calcGav().value;
  }

  let requestedShares = event.params.requestedShares;
  let investmentAmount = event.params.investmentAmount;
  let investmentAsset = event.params.investmentAsset;

  let amountInDenomationAsset = gav
    .times(event.params.requestedShares)
    .div(totalSupply);

  let investment = investmentEntity(
    event.params.requestOwner.toHex(),
    fund.id,
    event.block.timestamp
  );
  investment.shares = investment.shares.plus(requestedShares);
  investment.save();

  fund.investments = fund.investments.concat([investment.id]);
  fund.save();

  archiveInvestmentRequest(
    event.params.requestOwner.toHex(),
    hub,
    "EXECUTED",
    event.block.timestamp
  );

  let investmentHistory = new InvestmentHistory(event.transaction.hash.toHex());
  investmentHistory.timestamp = event.block.timestamp;
  investmentHistory.investment = event.params.requestOwner.toHex() + "/" + hub;
  investmentHistory.owner = event.params.requestOwner.toHex();
  investmentHistory.fund = hub;
  investmentHistory.action = "Investment";
  investmentHistory.shares = requestedShares;
  investmentHistory.amount = investmentAmount;
  investmentHistory.asset = investmentAsset.toHex();
  investmentHistory.amountInDenominationAsset = amountInDenomationAsset;
  investmentHistory.save();

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

  // calculate fund holdings

  let fundGavValid = true;
  let assetGav = BigInt.fromI32(0);
  let fundGavFromAssets = BigInt.fromI32(0);
  let holdings = accountingContract.getFundHoldings();

  let registryContract = RegistryContract.bind(
    Address.fromString(fund.registry!)
  );
  let priceSourceContract = PriceSourceContract.bind(
    registryContract.priceSource()
  );
  for (let k: i32 = 0; k < holdings.value0.length; k++) {
    let holdingAmount = holdings.value0[k];
    let holdingAddress = holdings.value1[k];

    let holdingsId =
      hub +
      "/" +
      event.block.timestamp.toString() +
      "/" +
      holdingAddress.toHex();
    let fundHoldingsHistory = new FundHoldingsHistory(holdingsId);
    fundHoldingsHistory.timestamp = event.block.timestamp;
    fundHoldingsHistory.fund = hub;
    fundHoldingsHistory.asset = holdingAddress.toHex();
    fundHoldingsHistory.amount = holdingAmount;

    if (!priceSourceContract.try_hasValidPrice(holdingAddress).reverted) {
      fundHoldingsHistory.validPrice = priceSourceContract.try_hasValidPrice(
        holdingAddress
      ).value;
      if (!accountingContract.try_calcAssetGAV(holdingAddress).reverted) {
        assetGav = accountingContract.try_calcAssetGAV(holdingAddress).value;
        fundGavFromAssets = fundGavFromAssets.plus(assetGav);
      } else {
        fundGavValid = false;
      }
    } else {
      fundHoldingsHistory.validPrice = false;
      fundGavValid = false;
    }

    fundHoldingsHistory.assetGav = assetGav;
    fundHoldingsHistory.save();

    // only save non-zero values
    // if (!holdingAmount.isZero()) {
    //   fundHoldingsHistory.save();
    // }
  }

  if (!fundGavValid) {
    return;
  }

  // do perform calculations
  let calcs = emptyCalcsObject() as AccountingContract__performCalculationsResult;

  if (!accountingContract.try_performCalculations().reverted) {
    calcs = accountingContract.try_performCalculations().value;
  }

  let fundGav = calcs.value0;
  let feesInDenomiationAsset = calcs.value1;
  let feesInShares = calcs.value2;
  let nav = calcs.value3;
  let sharePrice = calcs.value4;
  let gavPerShareNetManagementFee = calcs.value5;

  // update share price for investment, investmentHistory
  investment.sharePrice = sharePrice;
  investment.save();

  investmentHistory.sharePrice = sharePrice;
  investmentHistory.save();

  // save price calculation to history
  let calculationsId = hub + "/" + event.block.timestamp.toString();
  let calculations = new FundCalculationsHistory(calculationsId);
  calculations.fund = hub;
  calculations.timestamp = event.block.timestamp;
  calculations.gav = fundGav;
  calculations.validPrices = fundGavValid;
  calculations.feesInDenominationAsset = feesInDenomiationAsset;
  calculations.feesInShares = feesInShares;
  calculations.nav = nav;
  calculations.sharePrice = sharePrice;
  calculations.gavPerShareNetManagementFee = gavPerShareNetManagementFee;
  calculations.totalSupply = totalSupply;
  calculations.source = "investment";
  calculations.save();

  fund.gav = fundGav;
  fund.validPrice = fundGavValid;
  fund.totalSupply = totalSupply;
  fund.feesInDenominationAsset = feesInDenomiationAsset;
  fund.feesInShares = feesInShares;
  fund.nav = nav;
  fund.sharePrice = sharePrice;
  fund.gavPerShareNetManagementFee = gavPerShareNetManagementFee;
  fund.lastCalculationsUpdate = event.block.timestamp;
  fund.save();

  // update network gav
  state.networkGav = state.networkGav.plus(amountInDenomationAsset);
  state.save();

  // valuations for individual investments / investors
  let participationAddress = Address.fromString(fund.participation);
  let participationContract = ParticipationContract.bind(participationAddress);
  let historicalInvestors = participationContract.getHistoricalInvestors();
  for (let l: i32 = 0; l < historicalInvestors.length; l++) {
    let investor = historicalInvestors[l].toHex();

    let investment = investmentEntity(investor, fund.id, event.block.timestamp);

    let investmentGav = BigInt.fromI32(0);
    let investmentNav = BigInt.fromI32(0);
    if (!totalSupply.isZero()) {
      investmentGav = fundGav.times(investment.shares).div(totalSupply);
      investmentNav = nav.times(investment.shares).div(totalSupply);
    }
    investment.gav = investmentGav;
    investment.nav = investmentNav;
    investment.sharePrice = sharePrice;
    investment.save();

    // update investment valuation
    let investmentValuationHistory = new InvestmentValuationHistory(
      investment.id + "/" + event.block.timestamp.toString()
    );
    investmentValuationHistory.investment = investment.id;
    investmentValuationHistory.gav = investmentGav;
    investmentValuationHistory.nav = investmentNav;
    investmentValuationHistory.sharePrice = sharePrice;
    investmentValuationHistory.timestamp = event.block.timestamp;
    investmentValuationHistory.save();

    // update investor valuation
    let investorValuationHistory = investorValuationHistoryEntity(
      investor,
      event.block.timestamp
    );
    investorValuationHistory.gav = investorValuationHistory.gav.plus(
      investmentGav
    );
    investorValuationHistory.nav = investorValuationHistory.nav.plus(
      investmentNav
    );
    investorValuationHistory.timestamp = event.block.timestamp;
    investorValuationHistory.save();
  }
}

export function handleRedemption(event: Redemption): void {
  saveEvent("Redemption", event);

  let participation = Participation.load(event.address.toHex());
  if (!participation || !participation.fund) {
    return;
  }
  let fund = Fund.load(participation.fund);
  if (!fund) {
    return;
  }

  let hub = fund.id;

  let accountingContract = AccountingContract.bind(
    Address.fromString(fund.accounting)
  );

  let sharesContract = SharesContract.bind(Address.fromString(fund.share));
  let totalSupply = sharesContract.totalSupply();

  let investment = investmentEntity(
    event.params.redeemer.toHex(),
    fund.id,
    event.block.timestamp
  );
  investment.shares = investment.shares.minus(event.params.redeemedShares);
  investment.save();

  let investmentHistory = new InvestmentHistory(
    event.transaction.hash.toHex() + "/" + event.logIndex.toString()
  );
  investmentHistory.timestamp = event.block.timestamp;
  investmentHistory.investment = event.params.redeemer.toHex() + "/" + hub;
  investmentHistory.owner = event.params.redeemer.toHex();
  investmentHistory.fund = hub;
  investmentHistory.action = "Redemption";
  investmentHistory.sharePrice = fund.sharePrice;
  if (fund.sharePrice) {
    investmentHistory.amountInDenominationAsset = fund.sharePrice
      .times(event.params.redeemedShares)
      .div(tenToThePowerOf(BigInt.fromI32(18)));
  }
  investmentHistory.shares = event.params.redeemedShares;
  investmentHistory.save();

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

  // calculate fund holdings

  let fundGavValid = true;
  let assetGav = BigInt.fromI32(0);
  let fundGavFromAssets = BigInt.fromI32(0);
  let holdings = accountingContract.getFundHoldings();

  let registryContract = RegistryContract.bind(
    Address.fromString(fund.registry!)
  );
  let priceSourceContract = PriceSourceContract.bind(
    registryContract.priceSource()
  );
  for (let k: i32 = 0; k < holdings.value0.length; k++) {
    let holdingAmount = holdings.value0[k];
    let holdingAddress = holdings.value1[k];

    let holdingsId =
      hub +
      "/" +
      event.block.timestamp.toString() +
      "/" +
      holdingAddress.toHex();
    let fundHoldingsHistory = new FundHoldingsHistory(holdingsId);
    fundHoldingsHistory.timestamp = event.block.timestamp;
    fundHoldingsHistory.fund = hub;
    fundHoldingsHistory.asset = holdingAddress.toHex();
    fundHoldingsHistory.amount = holdingAmount;

    if (!priceSourceContract.try_hasValidPrice(holdingAddress).reverted) {
      fundHoldingsHistory.validPrice = priceSourceContract.try_hasValidPrice(
        holdingAddress
      ).value;
      if (!accountingContract.try_calcAssetGAV(holdingAddress).reverted) {
        assetGav = accountingContract.try_calcAssetGAV(holdingAddress).value;
        fundGavFromAssets = fundGavFromAssets.plus(assetGav);
      } else {
        fundGavValid = false;
      }
    } else {
      fundHoldingsHistory.validPrice = false;
      fundGavValid = false;
    }

    fundHoldingsHistory.assetGav = assetGav;
    fundHoldingsHistory.save();

    // only save non-zero values
    // if (!holdingAmount.isZero()) {
    //   fundHoldingsHistory.save();
    // }
  }

  // do perform calculations
  // if (!fundGavValid) {
  //   return;
  // }

  // do perform calculations
  let calcs = emptyCalcsObject() as AccountingContract__performCalculationsResult;

  if (!accountingContract.try_performCalculations().reverted) {
    calcs = accountingContract.try_performCalculations().value;
  }

  let fundGav = calcs.value0;
  let feesInDenomiationAsset = calcs.value1;
  let feesInShares = calcs.value2;
  let nav = calcs.value3;
  let sharePrice = calcs.value4;
  let gavPerShareNetManagementFee = calcs.value5;

  // save price calculation to history
  let calculationsId = hub + "/" + event.block.timestamp.toString();
  let calculations = new FundCalculationsHistory(calculationsId);
  calculations.fund = hub;
  calculations.timestamp = event.block.timestamp;
  calculations.gav = fundGav;
  calculations.validPrices = fundGavValid;
  calculations.feesInDenominationAsset = feesInDenomiationAsset;
  calculations.feesInShares = feesInShares;
  calculations.nav = nav;
  calculations.sharePrice = sharePrice;
  calculations.gavPerShareNetManagementFee = gavPerShareNetManagementFee;
  calculations.totalSupply = totalSupply;
  calculations.source = "redemption";
  calculations.save();

  fund.gav = fundGav;
  fund.validPrice = fundGavValid;
  fund.totalSupply = totalSupply;
  fund.feesInDenominationAsset = feesInDenomiationAsset;
  fund.feesInShares = feesInShares;
  fund.nav = nav;
  fund.sharePrice = sharePrice;
  fund.gavPerShareNetManagementFee = gavPerShareNetManagementFee;
  fund.lastCalculationsUpdate = event.block.timestamp;
  fund.save();

  // update network gav
  if (fund.sharePrice) {
    let state = currentState();
    let amountInDenominationAsset = fund.sharePrice
      .times(event.params.redeemedShares)
      .div(tenToThePowerOf(BigInt.fromI32(18)));
    state.networkGav = state.networkGav.minus(amountInDenominationAsset);
    state.save();
  }

  // valuations for individual investments / investors
  let participationAddress = Address.fromString(fund.participation);
  let participationContract = ParticipationContract.bind(participationAddress);
  let historicalInvestors = participationContract.getHistoricalInvestors();
  for (let l: i32 = 0; l < historicalInvestors.length; l++) {
    let investor = historicalInvestors[l].toHex();

    let investment = investmentEntity(investor, fund.id, event.block.timestamp);

    let investmentGav = BigInt.fromI32(0);
    let investmentNav = BigInt.fromI32(0);
    if (!totalSupply.isZero()) {
      investmentGav = fundGav.times(investment.shares).div(totalSupply);
      investmentNav = nav.times(investment.shares).div(totalSupply);
    }
    investment.gav = investmentGav;
    investment.nav = investmentNav;
    investment.sharePrice = sharePrice;
    investment.save();

    // update investment valuation
    let investmentValuationHistory = new InvestmentValuationHistory(
      investment.id + "/" + event.block.timestamp.toString()
    );
    investmentValuationHistory.investment = investment.id;
    investmentValuationHistory.gav = investmentGav;
    investmentValuationHistory.nav = investmentNav;
    investmentValuationHistory.sharePrice = sharePrice;
    investmentValuationHistory.timestamp = event.block.timestamp;
    investmentValuationHistory.save();

    // update investor valuation
    let investorValuationHistory = investorValuationHistoryEntity(
      investor,
      event.block.timestamp
    );
    investorValuationHistory.gav = investorValuationHistory.gav.plus(
      investmentGav
    );
    investorValuationHistory.nav = investorValuationHistory.nav.plus(
      investmentNav
    );
    investorValuationHistory.timestamp = event.block.timestamp;
    investorValuationHistory.save();
  }
}

export function handleEnableInvestment(event: EnableInvestment): void {
  saveEvent("EnableInvestment", event);

  let participation = Participation.load(event.address.toHex());
  if (!participation) {
    participation = new Participation(event.address.toHex());
    participation.allowedAssets = [];
  }
  let newAssets = event.params.asset.map<string>(value => value.toHex());
  let newAllowed = new Array<string>();
  for (let i: i32 = 0; i < newAssets.length; i++) {
    if (participation.allowedAssets.indexOf(newAssets[i]) === -1) {
      newAllowed = newAllowed.concat([newAssets[i]]);
    }
  }

  participation.allowedAssets = participation.allowedAssets.concat(newAllowed);
  participation.save();
}

export function handleDisableInvestment(event: DisableInvestment): void {
  saveEvent("DisableInvestment", event);

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
