import { Address, ethereum, BigDecimal } from '@graphprotocol/graph-ts';
import { ZERO_BD, logCritical, uniqueEventId } from '@enzymefinance/subgraph-utils';
import { Deposit, Depositor, TrancheAmount } from '../generated/schema';
import { increaseCounter } from './Counter';
import { createTrancheAmount, useTrancheAmount } from './TrancheAmount';

export function createDeposit(
  depositor: Depositor,
  trancheAmounts: TrancheAmount[],
  shares: BigDecimal,
  gavBeforeActivity: BigDecimal,
  vault: Address,
  event: ethereum.Event,
): Deposit {
  let deposit = new Deposit(uniqueEventId(event));
  let timestamp = event.block.timestamp.toI32();

  let amount = ZERO_BD;
  let firstPhaseAccruedRewards = ZERO_BD;
  let secondPhaseAccruedRewards = ZERO_BD;
  let initialTrancheAmounts: TrancheAmount[] = [];
  for (let i = 0; i < trancheAmounts.length; i++) {
    let trancheAmount = trancheAmounts[i];

    amount = amount.plus(trancheAmount.amount);
    firstPhaseAccruedRewards = firstPhaseAccruedRewards.plus(trancheAmount.firstPhaseAccruedRewards);
    secondPhaseAccruedRewards = secondPhaseAccruedRewards.plus(trancheAmount.secondPhaseAccruedRewards);
    initialTrancheAmounts.push(
      createTrancheAmount(
        trancheAmount.trancheId,
        trancheAmount.amount,
        trancheAmount.startStakingAt,
        trancheAmount.endStakingAt,
        'initial-tranche-amount',
        event,
      ),
    );
  }

  deposit.shares = shares;
  deposit.amount = amount;
  deposit.initialAmount = amount;
  deposit.trancheAmounts = trancheAmounts.map<string>((trancheAmount) => trancheAmount.id);
  deposit.initialTrancheAmounts = initialTrancheAmounts.map<string>((trancheAmount) => trancheAmount.id);
  deposit.depositor = depositor.id;
  deposit.vault = vault;
  deposit.createdAt = timestamp;
  deposit.updatedAt = timestamp;
  deposit.gavBeforeActivity = gavBeforeActivity;
  deposit.activityType = 'Deposit';
  deposit.activityCounter = increaseCounter('activities', timestamp);
  deposit.firstPhaseAccruedRewards = firstPhaseAccruedRewards;
  deposit.secondPhaseAccruedRewards = secondPhaseAccruedRewards;
  deposit.save();

  return deposit;
}

export function useDeposit(id: string): Deposit {
  let deposit = Deposit.load(id);
  if (deposit == null) {
    logCritical('Failed to load deposit {}.', [id.toString()]);
  }

  return deposit as Deposit;
}

export function updateRewardsForDeposit(deposit: Deposit, timestamp: i32): Deposit {
  let amount = ZERO_BD;
  let firstPhaseAccruedRewards = ZERO_BD;
  let secondPhaseAccruedRewards = ZERO_BD;
  for (let i = 0; i < deposit.trancheAmounts.length; i++) {
    let trancheAmount = useTrancheAmount(deposit.trancheAmounts[i]);

    amount = amount.plus(trancheAmount.amount);
    firstPhaseAccruedRewards = firstPhaseAccruedRewards.plus(trancheAmount.firstPhaseAccruedRewards);
    secondPhaseAccruedRewards = secondPhaseAccruedRewards.plus(trancheAmount.secondPhaseAccruedRewards);
  }

  deposit.updatedAt = timestamp;
  deposit.amount = amount;
  deposit.firstPhaseAccruedRewards = firstPhaseAccruedRewards;
  deposit.secondPhaseAccruedRewards = secondPhaseAccruedRewards;
  deposit.save();

  return deposit;
}
