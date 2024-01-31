import { ZERO_BD, logCritical } from '@enzymefinance/subgraph-utils';
import { BigDecimal, ethereum } from '@graphprotocol/graph-ts';
import { updateRewardsForDeposit } from '../entities/Deposit';
import { createTrancheAmount, updateTrancheAmount, useTrancheAmount } from '../entities/TrancheAmount';
import { Deposit, TrancheAmount } from '../generated/schema';
import { stakingEndTimestamp, stakingTranchesConfiguration } from './constants';

export function createDepositTrancheAmounts(
  vaultsTvlBeforeDeposit: BigDecimal,
  investmentAmount: BigDecimal,
  event: ethereum.Event,
): TrancheAmount[] {
  let tranchesDepositedTo: TrancheAmount[] = [];
  let amountLeftToDeposit = investmentAmount;
  let vaultsGav = vaultsTvlBeforeDeposit;
  let timestamp = event.block.timestamp.toI32();

  for (let i = 0; i < stakingTranchesConfiguration.length; i++) {
    let currentTranche = stakingTranchesConfiguration[i];

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

export function createRedemptionTrancheAmountsForAllDeposits(
  deposits: Deposit[],
  redemptionAmount: BigDecimal,
  event: ethereum.Event,
): TrancheAmount[] {
  let redemptionTrancheAmounts: TrancheAmount[] = [];
  let amountLeftToRedeem = redemptionAmount;
  let redemptionTimestamp = event.block.timestamp.toI32();

  // load all potential tranches
  let depositTrancheAmounts: TrancheAmount[] = [];
  let depositsForDepositTrancheAmounts: Deposit[] = [];

  let sortedDeposits = deposits.sort((a, b) => b.createdAt - a.createdAt);
  for (let i = 0; i < sortedDeposits.length; i++) {
    let deposit = sortedDeposits[i];
    let trancheAmounts = deposit.trancheAmounts
      .map<TrancheAmount>((trancheAmountId) => useTrancheAmount(trancheAmountId))
      .sort((a, b) => b.trancheId - a.trancheId);

    for (let j = 0; j < trancheAmounts.length; j++) {
      let trancheAmount = trancheAmounts[j];

      if (trancheAmount.amount > ZERO_BD) {
        depositTrancheAmounts.push(trancheAmount);
        depositsForDepositTrancheAmounts.push(deposit);
      }
    }
  }

  // loop through tranches
  for (let i = 0; i < depositTrancheAmounts.length; i++) {
    let depositTrancheAmount = depositTrancheAmounts[i];

    if (depositTrancheAmount.amount >= amountLeftToRedeem) {
      // Redemption tranche amount fits within the deposit tranche

      let amountToRedeemWithinTranche = amountLeftToRedeem;

      redemptionTrancheAmounts.push(
        createTrancheAmount(
          depositTrancheAmount.trancheId,
          amountToRedeemWithinTranche,
          depositTrancheAmount.startStakingAt,
          redemptionTimestamp,
          'redemption' + '/' + depositsForDepositTrancheAmounts[i].id,
          event,
        ),
      );

      // Reduce original deposit tranche amount
      updateTrancheAmount(
        depositTrancheAmount.id,
        depositTrancheAmount.amount.minus(amountToRedeemWithinTranche),
        redemptionTimestamp,
      );

      updateRewardsForDeposit(depositsForDepositTrancheAmounts[i], redemptionTimestamp);

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
          'redemption' + '/' + depositsForDepositTrancheAmounts[i].id,
          event,
        ),
      );

      // Reduce original deposit tranche amount
      updateTrancheAmount(
        depositTrancheAmount.id,
        depositTrancheAmount.amount.minus(amountToRedeemWithinTranche), // zero
        redemptionTimestamp,
      );

      updateRewardsForDeposit(depositsForDepositTrancheAmounts[i], redemptionTimestamp);

      amountLeftToRedeem = amountLeftToRedeem.minus(amountToRedeemWithinTranche);
    }
  }

  if (amountLeftToRedeem > ZERO_BD) {
    logCritical('Not ');
  }

  return redemptionTrancheAmounts;
}
