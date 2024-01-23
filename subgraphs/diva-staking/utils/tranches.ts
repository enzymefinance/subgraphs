import { BigDecimal, ethereum } from '@graphprotocol/graph-ts';
import { Deposit, TrancheAmount } from '../generated/schema';
import { useDeposit } from '../entities/Deposit';
import { ZERO_BD } from '@enzymefinance/subgraph-utils';
import { createTrancheAmount, useTrancheAmount } from '../entities/TrancheAmount';
import { stakingEndTimestamp } from './constants';

export class TrancheConfig {
  threshold: BigDecimal;
  divaPerEthPerDay: BigDecimal;

  constructor(threshold: BigDecimal, divaPerEthPerDay: BigDecimal) {
    this.threshold = threshold;
    this.divaPerEthPerDay = divaPerEthPerDay;
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

export function getDepositTrancheAmounts(
  vaultsGavBeforeDeposit: BigDecimal,
  investmentAmount: BigDecimal,
  event: ethereum.Event,
): TrancheAmount[] {
  let tranchesDepositedTo: TrancheAmount[] = [];
  let amountLeftToDeposit = investmentAmount;
  let vaultsGav = vaultsGavBeforeDeposit;
  let timestamp = event.block.timestamp.toI32();

  for (let i = 0; i < tranchesConfig.length; i++) {
    let currentTranche = tranchesConfig[i];

    // if gav is greater than tranche threshold skip that tranche
    if (currentTranche.threshold <= vaultsGav) {
      continue;
    }

    // check if invested amount left is lower than threshold, if yes then full investment amount left belongs to that tranche completely
    if (currentTranche.threshold >= vaultsGav.plus(amountLeftToDeposit)) {
      let fullTrancheAmount = createTrancheAmount(
        i,
        amountLeftToDeposit,
        timestamp,
        stakingEndTimestamp.toI32(),
        event,
      );
      tranchesDepositedTo.push(fullTrancheAmount);
      break;
    }

    let amountInvestedToCurrentTranche = currentTranche.threshold.minus(vaultsGav);
    amountLeftToDeposit = amountLeftToDeposit.minus(amountInvestedToCurrentTranche);

    let partialTrancheAmount = createTrancheAmount(
      i,
      amountInvestedToCurrentTranche,
      timestamp,
      stakingEndTimestamp.toI32(),
      event,
    );
    tranchesDepositedTo.push(partialTrancheAmount);

    vaultsGav = vaultsGav.plus(amountInvestedToCurrentTranche);
  }

  return tranchesDepositedTo;
}

// REDEMPTION

class RedemptionTrancheAmountsForDeposit {
  trancheAmounts: TrancheAmount[];
  amountLeftToRedeem: BigDecimal;
  deposit: Deposit;

  constructor(trancheAmounts: TrancheAmount[], amountLeftToRedeem: BigDecimal, deposit: Deposit) {
    this.trancheAmounts = trancheAmounts;
    this.amountLeftToRedeem = amountLeftToRedeem;
    this.deposit = deposit;
  }
}

export function createRedemptionTrancheAmountsForAllDeposits(
  deposits: Deposit[],
  redeemAmount: BigDecimal,
  event: ethereum.Event,
): TrancheAmount[] {
  let redemptionTranchesForDeposits: TrancheAmount[] = [];
  let amountLeftToRedeem = redeemAmount;

  // sort deposits by creation date descending (last deposit will be used first for redemption)
  deposits = deposits.sort((a, b) => b.createdAt - a.createdAt);

  for (let i = 0; i < deposits.length; i++) {
    if (amountLeftToRedeem.equals(ZERO_BD)) {
      break; // all amount redeemed
    }

    let redemptionTranchesForDeposit = createRedemptionTrancheAmountsForSingleDeposit(
      deposits[i],
      amountLeftToRedeem,
      event,
    );
    redemptionTranchesForDeposits = redemptionTranchesForDeposits.concat(redemptionTranchesForDeposit.trancheAmounts);

    amountLeftToRedeem = redemptionTranchesForDeposit.amountLeftToRedeem;
  }

  return redemptionTranchesForDeposits;
}

function createRedemptionTrancheAmountsForSingleDeposit(
  deposit: Deposit,
  redeemAmount: BigDecimal,
  event: ethereum.Event,
): RedemptionTrancheAmountsForDeposit {
  let redemptionTrancheAmounts: TrancheAmount[] = [];
  let amountLeftToRedeem = redeemAmount;
  let redemptionTimestamp = event.block.timestamp.toI32();

  // redeem from highest tranches (with least rewards) first
  for (let i = deposit.trancheAmounts.length - 1; i >= 0; i--) {
    let depositTrancheAmount = useTrancheAmount(deposit.trancheAmounts[i]);

    // skip tranches without money deposited to
    if (depositTrancheAmount.amount.equals(ZERO_BD)) {
      continue;
    }

    if (depositTrancheAmount.amount >= amountLeftToRedeem) {
      redemptionTrancheAmounts.push(
        createTrancheAmount(i, amountLeftToRedeem, depositTrancheAmount.startStakingAt, redemptionTimestamp, event),
      );

      depositTrancheAmount.amount = depositTrancheAmount.amount.minus(amountLeftToRedeem);
      depositTrancheAmount.save();

      amountLeftToRedeem = ZERO_BD;
      break; // we have redeemed all the funds
    } else {
      redemptionTrancheAmounts.push(
        createTrancheAmount(
          i,
          depositTrancheAmount.amount,
          depositTrancheAmount.startStakingAt,
          redemptionTimestamp,
          event,
        ),
      );

      depositTrancheAmount.amount = ZERO_BD;
      depositTrancheAmount.save();

      amountLeftToRedeem = amountLeftToRedeem.minus(depositTrancheAmount.amount);
    }
  }

  return new RedemptionTrancheAmountsForDeposit(redemptionTrancheAmounts, amountLeftToRedeem, deposit);
}
