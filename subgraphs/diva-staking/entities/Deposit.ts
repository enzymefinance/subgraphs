import { Address, ethereum, BigDecimal } from '@graphprotocol/graph-ts';
import { ZERO_BD, logCritical, uniqueEventId } from '@enzymefinance/subgraph-utils';
import { Deposit, Depositor } from '../generated/schema';
import { Tranche, tranchesConfig } from '../utils/tranches';
import { increaseCounter } from './Counter';

export function createDeposit(
  depositor: Depositor,
  tranches: Tranche[],
  gavBeforeActivity: BigDecimal,
  vault: Address,
  event: ethereum.Event,
): Deposit {
  let deposit = new Deposit(uniqueEventId(event));
  let timestamp = event.block.timestamp.toI32();

  // init array with zeroes
  let trancheAmounts = tranchesConfig.map<BigDecimal>(() => ZERO_BD);
  let amount = ZERO_BD;

  for (let i = 0; i < tranches.length; i++) {
    let tranche = tranches[i];

    trancheAmounts[tranche.id] = tranche.amount;
    amount = amount.plus(tranche.amount);
  }

  deposit.amount = amount;
  deposit.trancheAmounts = trancheAmounts;
  deposit.initialTrancheAmounts = trancheAmounts;
  deposit.depositor = depositor.id;
  deposit.vault = vault;
  deposit.createdAt = timestamp;
  deposit.updatedAt = timestamp;
  deposit.gavBeforeActivity = gavBeforeActivity;
  deposit.activityType = 'Deposit';
  deposit.activityCounter = increaseCounter('activities', timestamp);
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
