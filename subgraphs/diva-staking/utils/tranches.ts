import { BigInt } from '@graphprotocol/graph-ts';

export class Tranche {
  amount: BigInt;
  id: number;

  constructor(amount: BigInt, id: number) {
    this.amount = amount;
    this.id = id;
  }
}

export class TrancheConfig {
  threshold: BigInt;
  divPerEthPerDay: number;

  constructor(threshold: BigInt, divPerEthPerDay: number) {
    this.threshold = threshold;
    this.divPerEthPerDay = divPerEthPerDay;
  }
}

export let tranchesConfig: TrancheConfig[] = [
  new TrancheConfig(BigInt.fromI32(10_000).times(BigInt.fromI32(10).pow(18)), 2.5),
  new TrancheConfig(BigInt.fromI32(20_000).times(BigInt.fromI32(10).pow(18)), 2.25),
  new TrancheConfig(BigInt.fromI32(30_000).times(BigInt.fromI32(10).pow(18)), 2),
  new TrancheConfig(BigInt.fromI32(40_000).times(BigInt.fromI32(10).pow(18)), 1.9),
  new TrancheConfig(BigInt.fromI32(50_000).times(BigInt.fromI32(10).pow(18)), 1.75),
  new TrancheConfig(BigInt.fromI32(60_000).times(BigInt.fromI32(10).pow(18)), 1.6),
  new TrancheConfig(BigInt.fromI32(70_000).times(BigInt.fromI32(10).pow(18)), 1.55),
  new TrancheConfig(BigInt.fromI32(80_000).times(BigInt.fromI32(10).pow(18)), 1.5),
  new TrancheConfig(BigInt.fromI32(90_000).times(BigInt.fromI32(10).pow(18)), 1.4),
  new TrancheConfig(BigInt.fromI32(100_00).times(BigInt.fromI32(10).pow(18)), 1.3),
];

// let mainnetLaunchTimestamp = BigInt.fromI32(1711839600); // 31st March 2024
let mainnetLaunchTimestamp = BigInt.fromI32(1698793200); // 1st Nov 2023
let dayUnix = BigInt.fromI32(60 * 60 * 24); // 1 day
let cooldownDays = 30;
let stakingDeadlineBeforeLaunchDays = 30;
let stakingDeadlineBeforeLaunchUnix = BigInt.fromI32(stakingDeadlineBeforeLaunchDays).times(dayUnix);
export let stakingDeadlineTimestamp = mainnetLaunchTimestamp.minus(stakingDeadlineBeforeLaunchUnix);
let stakingPeriodDays = 183 as i32;

export function getDepositTranches(vaultsGavBeforeDeposit: BigInt, investmentAmount: BigInt): Tranche[] {
  let tranchesDepositedTo: Tranche[] = [];
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
      tranchesDepositedTo.push(new Tranche(amountLeftToDeposit, i));
      break;
    }

    let amountInvestedToCurrentTranche = currentTranche.threshold.minus(vaultsGav);
    amountLeftToDeposit = amountLeftToDeposit.minus(amountInvestedToCurrentTranche);

    tranchesDepositedTo.push(new Tranche(amountInvestedToCurrentTranche, i));

    vaultsGav = vaultsGav.plus(amountInvestedToCurrentTranche);
  }

  return tranchesDepositedTo;
}

export function getRedemptionTranches(trancheAmounts: BigInt[], redeemAmount: BigInt): Tranche[] {
  let tranchesRedeemedFrom: Tranche[] = [];
  let amountLeftToRedeem = redeemAmount;

  for (let i = trancheAmounts.length - 1; i >= 0; i--) {
    let currentTrancheAmount = trancheAmounts[i];

    // skip tranches without money deposited to
    if (currentTrancheAmount == BigInt.fromI32(0)) {
      continue;
    }

    if (currentTrancheAmount >= amountLeftToRedeem) {
      tranchesRedeemedFrom.push(new Tranche(amountLeftToRedeem.neg(), i));
      // we have redeemed all the funds, end the algorithm
      break;
    } else {
      tranchesRedeemedFrom.push(new Tranche(currentTrancheAmount.neg(), i));
      amountLeftToRedeem = amountLeftToRedeem.minus(currentTrancheAmount);
    }
  }

  return tranchesRedeemedFrom;
}

export class Claim {
  firstClaimAmount: BigInt;
  secondClaimAmount: BigInt;

  constructor(firstClaimAmount: BigInt, secondClaimAmount: BigInt) {
    this.firstClaimAmount = firstClaimAmount;
    this.secondClaimAmount = secondClaimAmount;
  }
}

export function getAccruedRewards(currentTimestamp: BigInt, tranches: Tranche[]): Claim {
  if (currentTimestamp < mainnetLaunchTimestamp) {
    return new Claim(BigInt.fromI32(0), BigInt.fromI32(0));
  }

  let daysStaked = currentTimestamp.minus(stakingDeadlineTimestamp).div(dayUnix).toI32();
  daysStaked = Math.min(daysStaked, stakingPeriodDays) as i32; // rewards accrue max until staking period ends

  let firstClaimAmount = BigInt.fromI32(0);
  let secondClaimAmount = BigInt.fromI32(0);

  for (let i = 0; i < tranches.length; i++) {
    let tranche = tranches[i];
    let trancheAccruedRewards = getTrancheAccruedRewards(
      tranche.amount.neg(), // redemption has minus sign, so we have to reverse it
      tranchesConfig[tranche.id as i32].divPerEthPerDay,
      daysStaked,
    );

    firstClaimAmount = firstClaimAmount.plus(trancheAccruedRewards.firstClaimAmount);
    secondClaimAmount = secondClaimAmount.plus(trancheAccruedRewards.secondClaimAmount);
  }

  return new Claim(firstClaimAmount, secondClaimAmount);
}

function getTrancheAccruedRewards(amount: BigInt, divPerEthPerDay: number, daysStaked: number): Claim {
  // scale numbers so we won't loose precision
  let scale = 10 ** 6;
  let scaleBigInt = BigInt.fromU64(scale);

  if (daysStaked <= cooldownDays) {
    // first half is available after cooldown, and second after staking ends
    let firstClaimAmount = amount
      .times(BigInt.fromU64((divPerEthPerDay * daysStaked * scale) as u64).div(BigInt.fromI32(2)))
      .div(scaleBigInt);

    return new Claim(firstClaimAmount, firstClaimAmount);
  }
  // first half is available after cooldown period, and second after staking ends
  let firstClaimAmount = amount
    .times(BigInt.fromU64((divPerEthPerDay * cooldownDays * scale) as u64))
    .div(BigInt.fromI32(2))
    .div(scaleBigInt);

  let secondClaimAmount = amount
    .times(BigInt.fromU64((divPerEthPerDay * (daysStaked - cooldownDays) * scale) as i64))
    .div(scaleBigInt);

  return new Claim(firstClaimAmount, firstClaimAmount.plus(secondClaimAmount));
}
