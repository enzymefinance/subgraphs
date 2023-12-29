import { BigInt } from '@graphprotocol/graph-ts';

export const tranchesConfig = [
  {
    threshold: BigInt.fromI32(10_000),
  },
  {
    threshold: BigInt.fromI32(20_000),
  },
  {
    threshold: BigInt.fromI32(30_000),
  },
  {
    threshold: BigInt.fromI32(40_000),
  },
  {
    threshold: BigInt.fromI32(50_000),
  },
  {
    threshold: BigInt.fromI32(60_000),
  },
  {
    threshold: BigInt.fromI32(70_000),
  },
  {
    threshold: BigInt.fromI32(80_000),
  },
  {
    threshold: BigInt.fromI32(90_000),
  },
  {
    threshold: BigInt.fromI32(100_000),
  },
];

export function getDepositTranches(
  vaultsGavBeforeDeposit: BigInt,
  investmentAmount: BigInt,
): { amount: BigInt; id: number }[] {
  let tranchesDepositedTo: { amount: BigInt; id: number }[] = [];
  let amountLeftToDeposit = investmentAmount;
  let vaultsGav = vaultsGavBeforeDeposit;

  for (let i = 0; i < tranchesConfig.length; i++) {
    let currentTranche = tranchesConfig[i];

    // if gav is greater than tranche threshold skip that tranche
    if (currentTranche.threshold < vaultsGav) {
      continue;
    }

    let vaultsGavAndAmountLeftToClassify = vaultsGav.plus(amountLeftToDeposit);

    // check if invested amount left is lower than threshold, if yes then full investment amount left belongs to that tranche completly
    if (currentTranche.threshold >= vaultsGavAndAmountLeftToClassify) {
      tranchesDepositedTo.push({
        amount: amountLeftToDeposit,
        id: i,
      });
      break;
    }

    let amountInvestedToCurrentTranche = currentTranche.threshold.minus(vaultsGav);
    amountLeftToDeposit = amountLeftToDeposit.minus(amountInvestedToCurrentTranche);
    tranchesDepositedTo.push({
      amount: amountInvestedToCurrentTranche,
      id: i,
    });

    vaultsGav = vaultsGav.plus(amountInvestedToCurrentTranche);
  }

  return tranchesDepositedTo;
}

export function getRedemptionTranches(
  trancheAmounts: BigInt[],
  redeemAmount: BigInt,
): { amount: BigInt; id: number }[] {
  let tranchesRedeemedFrom: { amount: BigInt; id: number }[] = [];
  let amountLeftToRedeem = redeemAmount;

  for (let i = trancheAmounts.length - 1; i >= 0; i--) {
    let currentTrancheAmount = trancheAmounts[i];

    // skip tranches without money deposited to
    if (currentTrancheAmount == BigInt.fromI32(0)) {
      continue;
    }

    if (currentTrancheAmount >= amountLeftToRedeem) {
      tranchesRedeemedFrom.push({
        amount: amountLeftToRedeem.neg(),
        id: i,
      });
      // we have redeemed all the funds, end the algorithm
      break;
    } else {
      tranchesRedeemedFrom.push({
        amount: currentTrancheAmount.neg(),
        id: i,
      });
      amountLeftToRedeem = amountLeftToRedeem.minus(currentTrancheAmount);
    }
  }

  return tranchesRedeemedFrom;
}
