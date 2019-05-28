import {
  FeeRegistration,
  FeeReward
} from "../types/FeeManagerFactoryDataSource/templates/FeeManagerDataSource/FeeManagerContract";
import {
  FeeManager,
  ManagementFee,
  PerformanceFee,
  FeeRewardHistory
} from "../types/schema";

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
}
