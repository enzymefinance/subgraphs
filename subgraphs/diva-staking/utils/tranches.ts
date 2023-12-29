import { BigInt } from '@graphprotocol/graph-ts';

export const tranchesConfig = [
  {
    threshold: BigInt.fromI32(10_000),
    divPerEthPerDay: 2.5,
  },
  {
    threshold: BigInt.fromI32(20_000),
    divPerEthPerDay: 2.25,
  },
  {
    threshold: BigInt.fromI32(30_000),
    divPerEthPerDay: 2,
  },
  {
    threshold: BigInt.fromI32(40_000),
    divPerEthPerDay: 1.9,
  },
  {
    threshold: BigInt.fromI32(50_000),
    divPerEthPerDay: 1.75,
  },
  {
    threshold: BigInt.fromI32(60_000),
    divPerEthPerDay: 1.6,
  },
  {
    threshold: BigInt.fromI32(70_000),
    divPerEthPerDay: 1.55,
  },
  {
    threshold: BigInt.fromI32(80_000),
    divPerEthPerDay: 1.5,
  },
  {
    threshold: BigInt.fromI32(90_000),
    divPerEthPerDay: 1.4,
  },
  {
    threshold: BigInt.fromI32(100_000),
    divPerEthPerDay: 1.3,
  },
];

let mainnetLaunchTimestamp = BigInt.fromI32(1711839600); // 31st March 2024
let dayUnix = BigInt.fromI32(60 * 60 * 24); // 1 day
let cooldownDays = 30;
let stakingDeadlineBeforeLaunchDays = 30;
let stakingDeadlineBeforeLaunchUnix = BigInt.fromI32(stakingDeadlineBeforeLaunchDays).times(dayUnix);
export let stakingDeadlineTimestamp = mainnetLaunchTimestamp.minus(stakingDeadlineBeforeLaunchUnix);
let stakingPeriodDays = 183;

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

export function getAccruedRewards(
  currentTimestamp: BigInt,
  tranches: { amount: BigInt; id: number }[],
): { firstClaimAmount: BigInt; secondClaimAmount: BigInt } {
  if (currentTimestamp < mainnetLaunchTimestamp) {
    return { firstClaimAmount: BigInt.fromI32(0), secondClaimAmount: BigInt.fromI32(0) };
  }

  let daysStaked = currentTimestamp.minus(stakingDeadlineTimestamp).div(dayUnix).toI32();
  daysStaked = Math.max(daysStaked, stakingPeriodDays); // rewards accrue max until staking period ends

  let firstClaimAmount = BigInt.fromI32(0);
  let secondClaimAmount = BigInt.fromI32(0);

  for (let i = 0; i < tranches.length; i++) {
    let tranche = tranches[i];
    let trancheAccruedRewards = getTrancheAccruedRewards(
      tranche.amount,
      tranchesConfig[tranche.id].divPerEthPerDay,
      daysStaked,
    );

    firstClaimAmount = firstClaimAmount.plus(trancheAccruedRewards.firstClaimAmount);
    secondClaimAmount = secondClaimAmount.plus(trancheAccruedRewards.firstClaimAmount);
  }

  return { firstClaimAmount, secondClaimAmount };
}

function getTrancheAccruedRewards(
  amount: BigInt,
  divPerEthPerDay: number,
  daysStaked: number,
): { firstClaimAmount: BigInt; secondClaimAmount: BigInt } {
  // scale numbers so we won't loose precision
  let scale = 10 ** 6;

  if (daysStaked <= cooldownDays) {
    // first half is available after cooldown, and second after staking ends
    let firstClaimAmount = amount
      .times(BigInt.fromU64(divPerEthPerDay * daysStaked * scale).div(BigInt.fromI32(2)))
      .div(BigInt.fromU64(scale));

    return { firstClaimAmount, secondClaimAmount: firstClaimAmount };
  }
  // first half is available after cooldown period, and second after staking ends
  let firstClaimAmount = amount
    .times(BigInt.fromU64(divPerEthPerDay * cooldownDays * scale).div(BigInt.fromI32(2)))
    .div(BigInt.fromU64(scale));

  let secondClaimAmount = amount
    .times(BigInt.fromU64(divPerEthPerDay * (daysStaked - cooldownDays) * scale))
    .div(BigInt.fromU64(scale));

  return { firstClaimAmount, secondClaimAmount: firstClaimAmount.plus(secondClaimAmount) };
}
