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

let mainnetLaunchTimestamp = BigInt.fromI32(1711839600); // 31st March 2024
let dayUnix = BigInt.fromI32(60 * 60 * 24); // 1 day
let cooldownDays = 30;
let stakingDeadlineBeforeLaunchDays = 30;
let stakingDeadlineBeforeLaunchUnix = BigInt.fromI32(stakingDeadlineBeforeLaunchDays).times(dayUnix);
export let stakingDeadlineTimestamp = mainnetLaunchTimestamp.minus(stakingDeadlineBeforeLaunchUnix);
let stakingPeriodDays = 183 as i32;

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
  depositId: string;

  constructor(tranches: Tranche[], amountLeftToRedeem: BigDecimal, depositId: string) {
    this.tranches = tranches;
    this.amountLeftToRedeem = amountLeftToRedeem;
    this.depositId = depositId;
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

    amountLeftToRedeem = amountLeftToRedeem.minus(redemptionTranchesForDeposit.amountLeftToRedeem);
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
      tranchesRedeemedFrom.push(new Tranche(amountLeftToRedeem.neg(), i));
      break; // we have redeemed all the funds, end the algorithm
    } else {
      tranchesRedeemedFrom.push(new Tranche(currentTrancheAmount.neg(), i));
      amountLeftToRedeem = amountLeftToRedeem.minus(currentTrancheAmount);
    }
  }

  return new RedemptionTranchesForDepositResponse(tranchesRedeemedFrom, amountLeftToRedeem, deposit.id);
}

export function getSumOfRedemptionTranches(
  redemptionTranchesForDeposits: RedemptionTranchesForDepositResponse[],
): Tranche[] {
  let tranches: Tranche[] = [];

  for (let i = 0; i < redemptionTranchesForDeposits.length; i++) {
    let redemptionTranchesForDeposit = redemptionTranchesForDeposits[i].tranches;

    for (let i = 0; i < redemptionTranchesForDeposit.length; i++) {
      let redemptionTrancheForDeposit = redemptionTranchesForDeposit[i];

      if (tranches.some((tranche) => tranche.id == redemptionTrancheForDeposit.id)) {
        // check if trancheId already exists
        let trancheIndex = tranches.findIndex((tranche) => tranche.id == redemptionTrancheForDeposit.id);
        tranches[trancheIndex].amount = tranches[trancheIndex].amount.plus(redemptionTrancheForDeposit.amount); // if yes, add amount to existing trancheId
      } else {
        tranches.push(redemptionTrancheForDeposit); // if no, add new tranche
      }
    }
  }

  return tranches;
}

// REWARDS

export class Claim {
  firstClaimAmount: BigDecimal;
  secondClaimAmount: BigDecimal;

  constructor(firstClaimAmount: BigDecimal, secondClaimAmount: BigDecimal) {
    this.firstClaimAmount = firstClaimAmount;
    this.secondClaimAmount = secondClaimAmount;
  }
}

// export function getAccruedRewards(currentTimestamp: BigInt, tranches: Tranche[]): Claim {
//   if (currentTimestamp < mainnetLaunchTimestamp) {
//     return new Claim(BigDecimal.zero(), BigDecimal.zero());
//   }

//   let daysStaked = currentTimestamp.minus(stakingDeadlineTimestamp).div(dayUnix).toI32();
//   daysStaked = Math.min(daysStaked, stakingPeriodDays) as i32; // rewards accrue max until staking period ends

//   let firstClaimAmount = BigDecimal.zero();
//   let secondClaimAmount = BigDecimal.zero();

//   for (let i = 0; i < tranches.length; i++) {
//     let tranche = tranches[i];
//     let trancheAccruedRewards = getTrancheAccruedRewards(
//       tranche.amount.neg(), // redemption has minus sign, so we have to reverse it
//       tranchesConfig[tranche.id as i32].divPerEthPerDay,
//       daysStaked,
//     );

//     firstClaimAmount = firstClaimAmount.plus(trancheAccruedRewards.firstClaimAmount);
//     secondClaimAmount = secondClaimAmount.plus(trancheAccruedRewards.secondClaimAmount);
//   }

//   return new Claim(firstClaimAmount, secondClaimAmount);
// }

// function getTrancheAccruedRewards(amount: BigDecimal, divPerEthPerDay: BigDecimal, daysStaked: number): Claim {
//   // scale numbers so we won't loose precision
//   let scale = 10 ** 6;
//   let scaleBigDecimal = BigDecimal.fromU64(scale);

//   if (daysStaked <= cooldownDays) {
//     // first half is available after cooldown, and second after staking ends
//     let firstClaimAmount = amount
//       .times(BigDecimal.fromU64((divPerEthPerDay * daysStaked * scale) as u64).div(BigDecimal.fromI32(2)))
//       .div(scaleBigDecimal);

//     return new Claim(firstClaimAmount, firstClaimAmount);
//   }
//   // first half is available after cooldown period, and second after staking ends
//   let firstClaimAmount = amount
//     .times(BigDecimal.fromU64((divPerEthPerDay * cooldownDays * scale) as u64))
//     .div(BigDecimal.fromI32(2))
//     .div(scaleBigDecimal);

//   let secondClaimAmount = amount
//     .times(BigDecimal.fromU64((divPerEthPerDay * (daysStaked - cooldownDays) * scale) as i64))
//     .div(scaleBigDecimal);

//   return new Claim(firstClaimAmount, firstClaimAmount.plus(secondClaimAmount));
// }
