import { BigDecimal, ethereum } from '@graphprotocol/graph-ts';
import { Deposit, TrancheAmount } from '../generated/schema';
import { updateRewardsForDeposit } from '../entities/Deposit';
import { ZERO_BD } from '@enzymefinance/subgraph-utils';
import { createTrancheAmount, updateTrancheAmount, useTrancheAmount } from '../entities/TrancheAmount';
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

export function createDepositTrancheAmounts(
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

    // If the current total GAV is greater than tranche threshold, then skip the tranche
    if (currentTranche.threshold <= vaultsGav) {
      continue;
    }

    // If remaining deposit amount is lower than the tranche threshold, then the full remaining deposit amount is allocated to the tranche
    if (currentTranche.threshold >= vaultsGav.plus(amountLeftToDeposit)) {
      let fullTrancheAmount = createTrancheAmount(
        i,
        amountLeftToDeposit,
        timestamp,
        stakingEndTimestamp.toI32(),
        'deposit',
        event,
      );

      tranchesDepositedTo.push(fullTrancheAmount);

      break; //
    }

    // Deposit amount is partially allocated to the tranche
    let amountInvestedToCurrentTranche = currentTranche.threshold.minus(vaultsGav);
    amountLeftToDeposit = amountLeftToDeposit.minus(amountInvestedToCurrentTranche);

    let partialTrancheAmount = createTrancheAmount(
      i,
      amountInvestedToCurrentTranche,
      timestamp,
      stakingEndTimestamp.toI32(),
      'deposit',
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
  let redemptionTimestamp = event.block.timestamp.toI32();

  // Sort deposits by creation date descending (last deposit will be used first for redemption)
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

    updateRewardsForDeposit(deposits[i], redemptionTimestamp);

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
      // Redemption tranche amount fits within the deposit tranche

      let amountToRedeemWithinTranche = amountLeftToRedeem;

      redemptionTrancheAmounts.push(
        createTrancheAmount(
          depositTrancheAmount.trancheId,
          amountToRedeemWithinTranche,
          depositTrancheAmount.startStakingAt,
          redemptionTimestamp,
          'redemption' + '/' + deposit.id,
          event,
        ),
      );

      // Reduce original deposit tranche amount
      updateTrancheAmount(
        depositTrancheAmount.id,
        depositTrancheAmount.amount.minus(amountToRedeemWithinTranche),
        redemptionTimestamp,
      );

      amountLeftToRedeem = amountLeftToRedeem.minus(amountToRedeemWithinTranche); // zero

      break; // we have redeemed all the funds
    } else {
      // Redemption tranche amount does not fully fit within the deposit tranche

      let amountToRedeemWithinTranche = depositTrancheAmount.amount;

      redemptionTrancheAmounts.push(
        createTrancheAmount(
          depositTrancheAmount.trancheId,
          amountToRedeemWithinTranche,
          depositTrancheAmount.startStakingAt,
          redemptionTimestamp,
          'redemption' + '/' + deposit.id,
          event,
        ),
      );

      // Reduce original deposit tranche amount
      updateTrancheAmount(
        depositTrancheAmount.id,
        depositTrancheAmount.amount.minus(amountToRedeemWithinTranche), // zero
        redemptionTimestamp,
      );

      amountLeftToRedeem = amountLeftToRedeem.minus(amountToRedeemWithinTranche);
    }
  }

  return new RedemptionTrancheAmountsForDeposit(redemptionTrancheAmounts, amountLeftToRedeem, deposit);
}
