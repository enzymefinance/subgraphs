import { ZERO_BD, logCritical, uniqueEventId } from '@enzymefinance/subgraph-utils';
import { Address, BigDecimal, ethereum } from '@graphprotocol/graph-ts';
import { Deposit, Depositor, TrancheAmount } from '../generated/schema';
import { useComptroller } from './Comptroller';
import { increaseCounter } from './Counter';
import { createTrancheAmount, useTrancheAmount } from './TrancheAmount';

export function createDeposit(
  depositor: Depositor,
  trancheAmounts: TrancheAmount[],
  shares: BigDecimal,
  tvlBeforeActivity: BigDecimal,
  comptroller: Address,
  event: ethereum.Event,
): Deposit {
  let deposit = new Deposit(uniqueEventId(event));
  let timestamp = event.block.timestamp.toI32();

  let amount = ZERO_BD;
  let firstPhaseRewards = ZERO_BD;
  let secondPhaseRewards = ZERO_BD;
  let totalRewards = ZERO_BD;
  let initialTrancheAmounts: TrancheAmount[] = [];
  for (let i = 0; i < trancheAmounts.length; i++) {
    let trancheAmount = trancheAmounts[i];

    amount = amount.plus(trancheAmount.amount);
    firstPhaseRewards = firstPhaseRewards.plus(trancheAmount.firstPhaseRewards);
    secondPhaseRewards = secondPhaseRewards.plus(trancheAmount.secondPhaseRewards);
    totalRewards = totalRewards.plus(trancheAmount.totalRewards);

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
  deposit.vault = useComptroller(comptroller).vault;
  deposit.createdAt = timestamp;
  deposit.updatedAt = timestamp;
  deposit.tvlBeforeActivity = tvlBeforeActivity;
  deposit.activityType = 'Deposit';
  deposit.activityCounter = increaseCounter('activities', timestamp);
  deposit.firstPhaseRewards = firstPhaseRewards;
  deposit.secondPhaseRewards = secondPhaseRewards;
  deposit.totalRewards = totalRewards;
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
  let firstPhaseRewards = ZERO_BD;
  let secondPhaseRewards = ZERO_BD;
  let totalRewards = ZERO_BD;

  for (let i = 0; i < deposit.trancheAmounts.length; i++) {
    let trancheAmount = useTrancheAmount(deposit.trancheAmounts[i]);

    amount = amount.plus(trancheAmount.amount);
    firstPhaseRewards = firstPhaseRewards.plus(trancheAmount.firstPhaseRewards);
    secondPhaseRewards = secondPhaseRewards.plus(trancheAmount.secondPhaseRewards);
    totalRewards = totalRewards.plus(trancheAmount.totalRewards);
  }

  deposit.updatedAt = timestamp;
  deposit.amount = amount;
  deposit.firstPhaseRewards = firstPhaseRewards;
  deposit.secondPhaseRewards = secondPhaseRewards;
  deposit.totalRewards = totalRewards;
  deposit.save();

  return deposit;
}
