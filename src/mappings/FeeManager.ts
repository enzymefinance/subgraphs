import {
  FeeRegistration,
  FeeReward
} from "../types/FeeManagerFactoryDataSource/templates/FeeManagerDataSource/FeeManagerContract";
import {
  FeeManager,
  ManagementFee,
  PerformanceFee,
  FeeRewardHistory,
  Fund,
  InvestmentHistory
} from "../types/schema";
import { investmentEntity } from "./entities/investmentEntity";
import { FeeManagerContract } from "../types/PriceSourceDataSource/FeeManagerContract";
import { HubContract } from "../types/ParticipationFactoryDataSource/templates/ParticipationDataSource/HubContract";
import { Address } from "@graphprotocol/graph-ts";

export function handleFeeRegistration(event: FeeRegistration): void {
  // unfortunately, this event only passes very limited data, so
  // we have to get everything through contract calls...

  let feeManager =
    FeeManager.load(event.address.toHex()) ||
    new FeeManager(event.address.toHex());

  if (!feeManager.managementFee) {
    let feeId = event.params.fee;

    let fee = new ManagementFee(feeId.toHex());
    fee.feeManager = event.address.toHex();
    fee.lastPayoutTime = event.block.timestamp;
    fee.save();

    feeManager.managementFee = feeId.toHex();
  } else {
    let feeId = event.params.fee;

    let fee = new PerformanceFee(feeId.toHex());
    fee.feeManager = event.address.toHex();
    fee.initializeTime = event.block.timestamp;
    fee.lastPayoutTime = event.block.timestamp;
    fee.save();

    feeManager.performanceFee = feeId.toHex();
  }
  feeManager.save();
}

export function handleFeeReward(event: FeeReward): void {
  let feeRewardHistory = new FeeRewardHistory(
    event.address.toHex() + "/" + event.block.timestamp.toString()
  );
  feeRewardHistory.feeManager = event.address.toHex();
  feeRewardHistory.shares = event.params.shareQuantity;
  feeRewardHistory.timestamp = event.block.timestamp;
  feeRewardHistory.save();

  let feeManager =
    FeeManager.load(event.address.toHex()) ||
    new FeeManager(event.address.toHex());
  feeManager.totalFeeReward = feeManager.totalFeeReward.plus(
    event.params.shareQuantity
  );
  feeManager.save();

  // add rewardeded fees to manager
  let feeManagerContract = FeeManagerContract.bind(event.address);
  let hubAddress = feeManagerContract.hub();
  let hubContract = HubContract.bind(hubAddress);
  let managerAddress = hubContract.manager();

  let investment = investmentEntity(managerAddress, hubAddress);
  investment.shares = investment.shares.plus(event.params.shareQuantity);
  investment.save();

  // let investmentHistory = new InvestmentHistory(event.transaction.hash.toHex());
  // investmentHistory.timestamp = event.block.timestamp;
  // investmentHistory.investment = managerAddress.toHex() + "/" + hubAddress.toHex();
  // investmentHistory.owner = managerAddress.toHex();
  // investmentHistory.fund = hubAddress.toHex();
  // investmentHistory.action = "Fee reward";
  // investmentHistory.shares = event.params.shareQuantity;
  // // investmentHistory.sharePrice = currentSharePrice;
  // // investmentHistory.amount = amount;
  // investmentHistory.asset = asset.toHex();
  // investmentHistory.amountInDenominationAsset = amount;
  // investmentHistory.save();
}
