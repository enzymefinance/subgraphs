import { BigDecimal, BigInt } from '@graphprotocol/graph-ts';
import { Deposit } from '../generated/schema';

export class Tranche {
  amount: BigDecimal;
  id: number;

  constructor(amount: BigDecimal, id: number) {
    this.amount = amount;
    this.id = id;
  }
}

export class TrancheConfig {
  threshold: BigDecimal;
  divPerEthPerDay: BigDecimal;

  constructor(threshold: BigDecimal, divPerEthPerDay: BigDecimal) {
    this.threshold = threshold;
    this.divPerEthPerDay = divPerEthPerDay;
  }
}

export let tranchesConfig: TrancheConfig[] = [
  new TrancheConfig(BigDecimal.fromString('10000'), BigDecimal.fromString('2.5')),
  new TrancheConfig(BigDecimal.fromString('20000'), BigDecimal.fromString('2.25')),
  new TrancheConfig(BigDecimal.fromString('30000'), BigDecimal.fromString('2')),
  new TrancheConfig(BigDecimal.fromString('40000'), BigDecimal.fromString('1.9')),
  new TrancheConfig(BigDecimal.fromString('50000'), BigDecimal.fromString('1.75')),
  new TrancheConfig(BigDecimal.fromString('60000'), BigDecimal.fromString('1.6')),
  new TrancheConfig(BigDecimal.fromString('70000'), BigDecimal.fromString('1.55')),
  new TrancheConfig(BigDecimal.fromString('80000'), BigDecimal.fromString('1.5')),
  new TrancheConfig(BigDecimal.fromString('90000'), BigDecimal.fromString('1.4')),
  new TrancheConfig(BigDecimal.fromString('100000'), BigDecimal.fromString('1.3')),
];

let mainnetLaunchTimestamp = BigInt.fromI32(1701388800); // 1st Dec 2023
let dayUnix = BigInt.fromI32(60 * 60 * 24); // 1 day
let cooldownDays: i32 = 30;
let stakingStartBeforeLaunchDays: i32 = 30;
let stakingStartTimestamp = mainnetLaunchTimestamp.minus(BigInt.fromI32(stakingStartBeforeLaunchDays).times(dayUnix));
let cooldownEndTimestamp = mainnetLaunchTimestamp.plus(BigInt.fromI32(cooldownDays).times(dayUnix));
let stakingPeriodDays: i32 = 183;
export let stakingEndTimestamp = stakingStartTimestamp.plus(BigInt.fromI32(stakingPeriodDays).times(dayUnix));

// DEPOSIT

export function getDepositTranches(vaultsGavBeforeDeposit: BigDecimal, investmentAmount: BigDecimal): Tranche[] {
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

// REDEMPTION

class RedemptionTranchesForDepositResponse {
  tranches: Tranche[];
  amountLeftToRedeem: BigDecimal;
  deposit: Deposit;

  constructor(tranches: Tranche[], amountLeftToRedeem: BigDecimal, deposit: Deposit) {
    this.tranches = tranches;
    this.amountLeftToRedeem = amountLeftToRedeem;
    this.deposit = deposit;
  }
}

export function getRedemptionTranchesForDeposits(
  deposits: Deposit[],
  redeemAmount: BigDecimal,
): RedemptionTranchesForDepositResponse[] {
  let redemptionTranchesForDeposits: RedemptionTranchesForDepositResponse[] = [];
  let amountLeftToRedeem = redeemAmount;

  for (let i = deposits.length - 1; i >= 0; i--) {
    if (amountLeftToRedeem.equals(BigDecimal.zero())) {
      break; // all amount redeemed
    }

    let redemptionTranchesForDeposit = getRedemptionTranchesForDeposit(deposits[i], amountLeftToRedeem);
    redemptionTranchesForDeposits.push(redemptionTranchesForDeposit);

    amountLeftToRedeem = redemptionTranchesForDeposit.amountLeftToRedeem;
  }

  return redemptionTranchesForDeposits;
}

function getRedemptionTranchesForDeposit(
  deposit: Deposit,
  redeemAmount: BigDecimal,
): RedemptionTranchesForDepositResponse {
  let tranchesRedeemedFrom: Tranche[] = [];
  let amountLeftToRedeem = redeemAmount;

  for (let i = deposit.trancheAmounts.length - 1; i >= 0; i--) {
    let currentTrancheAmount = deposit.trancheAmounts[i];

    // skip tranches without money deposited to
    if (currentTrancheAmount == BigDecimal.zero()) {
      continue;
    }

    if (currentTrancheAmount >= amountLeftToRedeem) {
      tranchesRedeemedFrom.push(new Tranche(amountLeftToRedeem, i));
      amountLeftToRedeem = BigDecimal.zero();
      break; // we have redeemed all the funds, end the algorithm
    } else {
      tranchesRedeemedFrom.push(new Tranche(currentTrancheAmount, i));
      amountLeftToRedeem = amountLeftToRedeem.minus(currentTrancheAmount);
    }
  }

  return new RedemptionTranchesForDepositResponse(tranchesRedeemedFrom, amountLeftToRedeem, deposit);
}

let redemptionTrancheForDepositId: number; // as Closures are not implemented yet this is hack suggested by https://www.assemblyscript.org/status.html#on-closures
export function getSumOfRedemptionTranches(
  redemptionTranchesForDeposits: RedemptionTranchesForDepositResponse[],
): Tranche[] {
  let tranches: Tranche[] = [];

  for (let i = 0; i < redemptionTranchesForDeposits.length; i++) {
    let redemptionTranchesForDeposit = redemptionTranchesForDeposits[i].tranches;

    for (let i = 0; i < redemptionTranchesForDeposit.length; i++) {
      let redemptionTrancheForDeposit = redemptionTranchesForDeposit[i];

      redemptionTrancheForDepositId = redemptionTrancheForDeposit.id;
      if (tranches.some((tranche) => tranche.id == redemptionTrancheForDepositId)) {
        // check if trancheId already exists
        let trancheIndex = tranches.findIndex((tranche) => tranche.id == redemptionTrancheForDepositId);
        tranches[trancheIndex].amount = tranches[trancheIndex].amount.plus(redemptionTrancheForDeposit.amount); // if yes, add amount to existing trancheId
      } else {
        tranches.push(redemptionTrancheForDeposit); // if no, add new tranche
      }
    }
  }

  return tranches;
}

// REWARDS

function secondsToFullDays(seconds: BigInt): i32 {
  return seconds.div(dayUnix).toI32();
}

class DaysStakedResponse {
  firstStepDays: i32;
  secondStepDays: i32;

  constructor(firstStepDays: i32, secondStepDays: i32) {
    this.firstStepDays = firstStepDays;
    this.secondStepDays = secondStepDays;
  }
}

function getDaysStaked(depositUpdatedAt: BigInt, currentTimestamp: BigInt): DaysStakedResponse {
  let depositStakingStartTimestamp =
    depositUpdatedAt < stakingStartTimestamp ? stakingStartTimestamp : depositUpdatedAt;

  if (currentTimestamp < cooldownEndTimestamp) {
    // redeem happened before cooldown period ended
    return new DaysStakedResponse(secondsToFullDays(currentTimestamp.minus(depositStakingStartTimestamp)), 0);
  }

  if (depositStakingStartTimestamp < cooldownEndTimestamp) {
    // stake happened before cooldown period ended
    // redeem happened after cooldown period ended
    return new DaysStakedResponse(
      secondsToFullDays(cooldownEndTimestamp.minus(depositStakingStartTimestamp)),
      Math.min(
        secondsToFullDays(currentTimestamp.minus(cooldownEndTimestamp)),
        stakingPeriodDays - cooldownDays - stakingStartBeforeLaunchDays,
      ) as i32,
    );
  }

  if (depositStakingStartTimestamp < stakingEndTimestamp) {
    // stake happened after cooldown period ended
    // redeem happened after cooldown period and before staking ended
    return new DaysStakedResponse(0, secondsToFullDays(currentTimestamp.minus(depositStakingStartTimestamp)));
  }

  // stake happened after cooldown period ended
  // redeem happened after stake period ended
  return new DaysStakedResponse(0, secondsToFullDays(stakingEndTimestamp.minus(depositStakingStartTimestamp)));
}

export class Claim {
  firstClaimAmount: BigDecimal;
  secondClaimAmount: BigDecimal;

  constructor(firstClaimAmount: BigDecimal, secondClaimAmount: BigDecimal) {
    this.firstClaimAmount = firstClaimAmount;
    this.secondClaimAmount = secondClaimAmount;
  }
}

export function getAccruedRewards(
  currentTimestamp: BigInt,
  redemptionTranchesForDeposits: RedemptionTranchesForDepositResponse[],
): Claim {
  if (currentTimestamp < mainnetLaunchTimestamp) {
    return new Claim(BigDecimal.zero(), BigDecimal.zero());
  }

  let firstClaimAmount = BigDecimal.zero();
  let secondClaimAmount = BigDecimal.zero();

  for (let i = 0; i < redemptionTranchesForDeposits.length; i++) {
    let redemptionTranchesForDeposit = redemptionTranchesForDeposits[i];

    let updatedAt = BigInt.fromI64(redemptionTranchesForDeposit.deposit.updatedAt);
    let daysStaked = getDaysStaked(updatedAt, currentTimestamp);

    for (let i = 0; i < redemptionTranchesForDeposit.tranches.length; i++) {
      let tranche = redemptionTranchesForDeposit.tranches[i];

      let trancheAccruedRewards = getTrancheAccruedRewards(
        tranche.amount,
        tranchesConfig[tranche.id as i32].divPerEthPerDay,
        daysStaked.firstStepDays,
        daysStaked.secondStepDays,
      );

      firstClaimAmount = firstClaimAmount.plus(trancheAccruedRewards.firstClaimAmount);
      secondClaimAmount = secondClaimAmount.plus(trancheAccruedRewards.secondClaimAmount);
    }
  }

  return new Claim(firstClaimAmount, secondClaimAmount);
}

function getTrancheAccruedRewards(
  amount: BigDecimal,
  divPerEthPerDay: BigDecimal,
  firstStepStakeDays: number,
  secondStepDaysStaked: number,
): Claim {
  let halfOfFirstClaimAmount = amount
    .times(divPerEthPerDay)
    .times(BigDecimal.fromString(firstStepStakeDays.toString()))
    .div(BigDecimal.fromString('2'));

  let secondClaimAmount = amount.times(divPerEthPerDay).times(BigDecimal.fromString(secondStepDaysStaked.toString()));

  return new Claim(halfOfFirstClaimAmount, halfOfFirstClaimAmount.plus(secondClaimAmount));
}
