import { BigDecimal } from '@graphprotocol/graph-ts';
import { Deposit } from '../generated/schema';
import { useDeposit } from '../entities/Deposit';
import { ZERO_BD } from '@enzymefinance/subgraph-utils';

export class Tranche {
  amount: BigDecimal;
  id: i32;

  constructor(amount: BigDecimal, id: i32) {
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

// DEPOSIT

export function getDepositTranches(vaultsGavBeforeDeposit: BigDecimal, investmentAmount: BigDecimal): Tranche[] {
  let tranchesDepositedTo: Tranche[] = [];
  let amountLeftToDeposit = investmentAmount;
  let vaultsGav = vaultsGavBeforeDeposit;

  for (let i = 0; i < tranchesConfig.length; i++) {
    let currentTranche = tranchesConfig[i];

    // if gav is greater than tranche threshold skip that tranche
    if (currentTranche.threshold <= vaultsGav) {
      continue;
    }

    // check if invested amount left is lower than threshold, if yes then full investment amount left belongs to that tranche completely
    if (currentTranche.threshold >= vaultsGav.plus(amountLeftToDeposit)) {
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

export class RedemptionTranchesForDepositResponse {
  tranches: Tranche[];
  amountLeftToRedeem: BigDecimal;
  deposit: Deposit;

  constructor(tranches: Tranche[], amountLeftToRedeem: BigDecimal, deposit: Deposit) {
    this.tranches = tranches;
    this.amountLeftToRedeem = amountLeftToRedeem;
    this.deposit = deposit;
  }
}

export function getRedemptionTranchesForAllDeposits(
  deposits: Deposit[],
  redeemAmount: BigDecimal,
): RedemptionTranchesForDepositResponse[] {
  let redemptionTranchesForDeposits: RedemptionTranchesForDepositResponse[] = [];
  let amountLeftToRedeem = redeemAmount;

  // sort deposits by creation date descending (last deposit will be used first for redemption)
  deposits = deposits.sort((a, b) => b.createdAt - a.createdAt);

  for (let i = 0; i < deposits.length; i++) {
    if (amountLeftToRedeem.equals(ZERO_BD)) {
      break; // all amount redeemed
    }

    let redemptionTranchesForDeposit = getRedemptionTranchesForSingleDeposit(deposits[i], amountLeftToRedeem);
    redemptionTranchesForDeposits.push(redemptionTranchesForDeposit);

    amountLeftToRedeem = redemptionTranchesForDeposit.amountLeftToRedeem;
  }

  return redemptionTranchesForDeposits;
}

function getRedemptionTranchesForSingleDeposit(
  deposit: Deposit,
  redeemAmount: BigDecimal,
): RedemptionTranchesForDepositResponse {
  let tranchesRedeemedFrom: Tranche[] = [];
  let amountLeftToRedeem = redeemAmount;

  // redeem from highest tranches (with least rewards) first
  for (let i = deposit.trancheAmounts.length - 1; i >= 0; i--) {
    let currentTrancheAmount = deposit.trancheAmounts[i];

    // skip tranches without money deposited to
    if (currentTrancheAmount.equals(ZERO_BD)) {
      continue;
    }

    if (currentTrancheAmount >= amountLeftToRedeem) {
      tranchesRedeemedFrom.push(new Tranche(amountLeftToRedeem, i));
      amountLeftToRedeem = ZERO_BD;
      break; // we have redeemed all the funds
    } else {
      tranchesRedeemedFrom.push(new Tranche(currentTrancheAmount, i));
      amountLeftToRedeem = amountLeftToRedeem.minus(currentTrancheAmount);
    }
  }

  return new RedemptionTranchesForDepositResponse(tranchesRedeemedFrom, amountLeftToRedeem, deposit);
}

export function getAggregatedRedemptionTranches(
  redemptionTranchesForAllDeposits: RedemptionTranchesForDepositResponse[],
): Tranche[] {
  let tranches: Tranche[] = [];

  for (let i = 0; i < redemptionTranchesForAllDeposits.length; i++) {
    let redemptionTranchesForSingleDeposit = redemptionTranchesForAllDeposits[i].tranches;

    for (let j = 0; j < redemptionTranchesForSingleDeposit.length; j++) {
      let singleRedemptionTrancheForSingleDeposit = redemptionTranchesForSingleDeposit[j];

      // check if tranche already exists
      let trancheAlreadyExists = false;
      for (let k = 0; k < tranches.length; k++) {
        let tranche = tranches[k];

        if (tranche.id === singleRedemptionTrancheForSingleDeposit.id) {
          tranches[k].amount = tranches[k].amount.plus(singleRedemptionTrancheForSingleDeposit.amount);
          trancheAlreadyExists = true;
          break;
        }
      }

      if (trancheAlreadyExists == false) {
        // even though redemptionTrancheForDeposit is also Tranche type we create new Tranche class in order not to have reference to old Tranche,
        // which could result in bug when we modify tranche
        tranches.push(
          new Tranche(singleRedemptionTrancheForSingleDeposit.amount, singleRedemptionTrancheForSingleDeposit.id),
        );
      }
    }
  }

  return tranches;
}

export function decreaseDepositTrancheAmounts(depositId: string, tranches: Tranche[], updatedAt: i32): Deposit {
  let deposit = useDeposit(depositId);

  let trancheAmounts = deposit.trancheAmounts;
  let amount = deposit.amount;

  for (let i = 0; i < tranches.length; i++) {
    let tranche = tranches[i];

    trancheAmounts[tranche.id] = trancheAmounts[tranche.id].minus(tranche.amount);
    amount = amount.minus(tranche.amount);
  }

  deposit.amount = amount;
  deposit.trancheAmounts = trancheAmounts;
  deposit.updatedAt = updatedAt;
  deposit.save();

  return deposit;
}

// REWARDS
