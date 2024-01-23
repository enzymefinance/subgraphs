import { Address, ethereum, BigDecimal, log } from '@graphprotocol/graph-ts';
import { ZERO_BD, logCritical, uniqueEventId } from '@enzymefinance/subgraph-utils';
import { Deposit, Depositor } from '../generated/schema';
import { Tranche, tranchesConfig } from '../utils/tranches';
import { getActivityCounter } from './ActivityCounter';

function depositId(depositor: Depositor, event: ethereum.Event): string {
  return depositor.id.toHex() + '/' + uniqueEventId(event);
}

export function createDeposit(depositor: Depositor, tranches: Tranche[], gavBeforeActivity: BigDecimal, vault: Address, event: ethereum.Event): Deposit {
  let deposit = new Deposit(depositId(depositor, event));

  // init array with zeroes
  let trancheAmounts = tranchesConfig.map<BigDecimal>(() => BigDecimal.zero());

  for (let i = 0; i < tranches.length; i++) {
    let tranche = tranches[i];

    trancheAmounts[tranche.id] = tranche.amount;
  }

  deposit.trancheAmounts = trancheAmounts;
  deposit.initialTrancheAmounts = trancheAmounts;
  deposit.depositor = depositor.id;
  deposit.vault = vault;
  deposit.createdAt = event.block.timestamp.toI32();
  deposit.updatedAt = event.block.timestamp.toI32();
  deposit.gavBeforeActivity = gavBeforeActivity;
  deposit.activityCounter = getActivityCounter()
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

