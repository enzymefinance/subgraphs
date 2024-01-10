import { Address, ethereum, BigDecimal } from '@graphprotocol/graph-ts';
import { logCritical, uniqueEventId } from '@enzymefinance/subgraph-utils';
import { Deposit, Depositor } from '../generated/schema';
import { Tranche, tranchesConfig } from '../utils/tranches';

function depositId(depositor: Address, event: ethereum.Event): string {
  return depositor.toHexString() + '/' + uniqueEventId(event);
}

export function createDeposit(depositor: Address, tranches: Tranche[], event: ethereum.Event): Deposit {
  let deposit = new Deposit(depositId(depositor, event));

  // init array with zeroes
  let trancheAmounts = tranchesConfig.map<BigDecimal>(() => BigDecimal.zero());

  for (let i = 0; i < tranches.length; i++) {
    let tranche = tranches[i];

    trancheAmounts[tranche.id as i32] = tranche.amount;
  }

  deposit.trancheAmounts = trancheAmounts;
  deposit.depositor = depositor;
  deposit.createdAt = event.block.timestamp.toI32();
  deposit.updatedAt = event.block.timestamp.toI32();
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

export function decreaseTrancheAmountsOfDeposit(
  depositId: string,
  tranches: Tranche[],
  event: ethereum.Event,
): Deposit {
  let deposit = useDeposit(depositId);

  let trancheAmounts = deposit.trancheAmounts;
  for (let i = 0; i < tranches.length; i++) {
    let tranche = tranches[i];

    trancheAmounts[tranche.id as i32] = trancheAmounts[tranche.id as i32].minus(tranche.amount);
  }
  deposit.trancheAmounts = trancheAmounts;
  deposit.updatedAt = event.block.timestamp.toI32();
  deposit.save();

  return deposit;
}
