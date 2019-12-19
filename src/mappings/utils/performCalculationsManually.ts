import { BigInt, Address } from "@graphprotocol/graph-ts";
import { FeeManagerContract } from "../../types/templates/PriceSourceDataSource/FeeManagerContract";
import { PerformanceFeeContract } from "../../types/templates/PriceSourceDataSource/PerformanceFeeContract";

import {
  AccountingContract__performCalculationsResult,
  AccountingContract
} from "../../types/templates/PriceSourceDataSource/AccountingContract";

export function performCalculationsManually(
  fundGavFromAssets: BigInt,
  totalSupply: BigInt,
  feeManagerAddress: Address,
  accountingContract: AccountingContract
): AccountingContract__performCalculationsResult {
  let calcs = new AccountingContract__performCalculationsResult(
    BigInt.fromI32(0),
    BigInt.fromI32(0),
    BigInt.fromI32(0),
    BigInt.fromI32(0),
    BigInt.fromI32(0),
    BigInt.fromI32(0)
  );

  calcs.value0 = fundGavFromAssets;

  let feeManagerContract = FeeManagerContract.bind(feeManagerAddress);

  // (management fee amount can be calculated by the contract (not dependent on price))
  let mgmtFeeAmount = feeManagerContract.managementFeeAmount();

  // (performance fee is dependent on price, so we need to calculate manually)
  let perfFeeAddress = feeManagerContract.fees(BigInt.fromI32(1));
  let perfFeeContract = PerformanceFeeContract.bind(perfFeeAddress);

  let gavPerShare = accountingContract.DEFAULT_SHARE_PRICE();
  if (totalSupply.gt(BigInt.fromI32(0))) {
    gavPerShare = accountingContract.valuePerShare(
      fundGavFromAssets,
      totalSupply
    );
  }

  let highWaterMark = perfFeeContract.highWaterMark(
    feeManagerContract._address
  );

  let perfFeeAmount = BigInt.fromI32(0);
  if (
    gavPerShare.gt(highWaterMark) &&
    !totalSupply.isZero() &&
    !gavPerShare.isZero()
  ) {
    let sharePriceGain = gavPerShare.minus(highWaterMark);
    let totalGain = sharePriceGain
      .times(totalSupply)
      .div(perfFeeContract.DIVISOR());
    let feeInAsset = totalGain.times(
      perfFeeContract
        .performanceFeeRate(feeManagerContract._address)
        .div(perfFeeContract.DIVISOR())
    );
    let preDilutionFee = totalSupply.times(feeInAsset).div(gavPerShare);
    perfFeeAmount = preDilutionFee
      .times(totalSupply)
      .div(totalSupply.minus(preDilutionFee));
  }
  calcs.value2 = mgmtFeeAmount.plus(perfFeeAmount);

  if (totalSupply.isZero()) {
    calcs.value1 = BigInt.fromI32(0);
  } else {
    calcs.value1 = calcs.value2
      .times(fundGavFromAssets)
      .div(totalSupply.plus(calcs.value2));
  }

  calcs.value3 = fundGavFromAssets.minus(calcs.value1);

  let totalSupplyAccountingForFees = totalSupply.plus(calcs.value2);
  if (totalSupply.isZero()) {
    calcs.value4 = accountingContract.DEFAULT_SHARE_PRICE();
    calcs.value5 = accountingContract.DEFAULT_SHARE_PRICE();
  } else {
    calcs.value4 = accountingContract.valuePerShare(
      fundGavFromAssets,
      totalSupplyAccountingForFees
    );
    calcs.value5 = accountingContract.valuePerShare(
      fundGavFromAssets,
      totalSupply.plus(mgmtFeeAmount)
    );
  }

  return calcs;
}
