import { Address, ethereum, BigDecimal } from '@graphprotocol/graph-ts';
import { ZERO_BD, logCritical, uniqueEventId } from '@enzymefinance/subgraph-utils';
import { Deposit, Depositor, TrancheAmount } from '../generated/schema';
import { increaseCounter } from './Counter';

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
  for (let i = 0; i < trancheAmounts.length; i++) {
    let trancheAmount = trancheAmounts[i];

    amount = amount.plus(trancheAmount.amount);
  }

  deposit.shares = shares;
  deposit.amount = amount;
  deposit.initialAmount = amount;
  deposit.trancheAmounts = trancheAmounts.map<string>((trancheAmount) => trancheAmount.id);
  deposit.initialTrancheAmounts = trancheAmounts.map<string>((trancheAmount) => trancheAmount.id);
  deposit.depositor = depositor.id;
  deposit.vault = vault;
  deposit.createdAt = timestamp;
  deposit.updatedAt = timestamp;
  deposit.gavBeforeActivity = gavBeforeActivity;
  deposit.activityType = 'Deposit';
  deposit.activityCounter = increaseCounter('activities', timestamp);
  deposit.firstPhaseAccruedRewards = ZERO_BD;
  deposit.secondPhaseAccruedRewards = ZERO_BD;
  deposit.save();

  return deposit;
}

export function useDeposit(depositId: string): Deposit {
  let deposit = Deposit.load(depositId);
  if (deposit == null) {
    logCritical('Failed to load deposit {}.', [depositId.toString()]);
  }

  return deposit as Deposit;
}
