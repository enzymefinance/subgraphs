import {
  FeeRegistration,
  FeeReward
} from "../types/templates/FeeManagerDataSource/FeeManagerContract";
import {
  FeeManager,
  ManagementFee,
  PerformanceFee,
  FeeRewardHistory
} from "../types/schema";
import { investmentEntity } from "./entities/investmentEntity";
import { FeeManagerContract } from "../types/PriceSourceDataSource/FeeManagerContract";
import { HubContract } from "../types/templates/ParticipationDataSource/HubContract";
import { BigInt } from "@graphprotocol/graph-ts";
import { ManagementFeeContract } from "../types/templates/FeeManagerDataSource/ManagementFeeContract";
import { PerformanceFeeContract } from "../types/templates/FeeManagerDataSource/PerformanceFeeContract";
import { saveEventHistory } from "./utils/saveEventHistory";

export function handleFeeRegistration(event: FeeRegistration): void {
  // this event only passes very limited data, so
  // we have to get everything through contract calls...
  let feeManager = FeeManager.load(event.address.toHex());
  if (!feeManager) {
    feeManager = new FeeManager(event.address.toHex());
    feeManager.feesRegistered = BigInt.fromI32(0);
    feeManager.save();
  }
  let feeManagerContract = FeeManagerContract.bind(event.address);

  // fee[0] is the management fee
  if (
    !feeManager.feesRegistered ||
    feeManager.feesRegistered.equals(BigInt.fromI32(0))
  ) {
    let mgmtFeeAddress = feeManagerContract.fees(BigInt.fromI32(0));
    let mgmtFeeContract = ManagementFeeContract.bind(mgmtFeeAddress);
    let mgmtFee = new ManagementFee(event.address.toHex() + "/mgmt");
    mgmtFee.feeManager = event.address.toHex();
    mgmtFee.managementFeeRate = mgmtFeeContract.managementFeeRate(
      event.address
    );
    mgmtFee.save();
    feeManager.feesRegistered = BigInt.fromI32(1);
    feeManager.save();

    saveEventHistory(
      event.transaction.hash.toHex() + "/mgmt",
      event.block.timestamp,
      feeManagerContract.hub().toHex(),
      "FeeManager",
      event.address.toHex(),
      "FeeRegistration",
      ["feeType", "rate"],
      ["Management Fee", mgmtFee.managementFeeRate.toString()]
    );
  }
  // fee[1] is the performance fee
  else {
    let perfFeeAddress = feeManagerContract.fees(BigInt.fromI32(1));
    let perfFeeContract = PerformanceFeeContract.bind(perfFeeAddress);
    let perfFee = new PerformanceFee(event.address.toHex() + "/perf");
    perfFee.feeManager = event.address.toHex();
    perfFee.performanceFeeRate = perfFeeContract.performanceFeeRate(
      event.address
    );
    perfFee.performanceFeePeriod = perfFeeContract.performanceFeePeriod(
      event.address
    );
    perfFee.initializeTime = perfFeeContract.initializeTime(event.address);
    perfFee.save();
    feeManager.feesRegistered = BigInt.fromI32(2);
    feeManager.save();

    saveEventHistory(
      event.transaction.hash.toHex() + "/perf",
      event.block.timestamp,
      feeManagerContract.hub().toHex(),
      "FeeManager",
      event.address.toHex(),
      "FeeRegistration",
      ["feeType", "rate", "period"],
      [
        "Performance Fee",
        perfFee.performanceFeeRate.toString(),
        perfFee.performanceFeePeriod.toString()
      ]
    );
  }
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

  // add rewardeded fees to manager's investment
  let feeManagerContract = FeeManagerContract.bind(event.address);
  let hubAddress = feeManagerContract.hub();
  let hubContract = HubContract.bind(hubAddress);
  let managerAddress = hubContract.manager();

  let investment = investmentEntity(
    managerAddress.toHex(),
    hubAddress.toHex(),
    event.block.timestamp
  );
  investment.shares = investment.shares.plus(event.params.shareQuantity);
  investment.save();

  saveEventHistory(
    event.transaction.hash.toHex(),
    event.block.timestamp,
    hubAddress.toHex(),
    "FeeManager",
    event.address.toHex(),
    "FeeReward",
    ["shares"],
    [event.params.shareQuantity.toString()]
  );
}
