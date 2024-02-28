import { Address, ethereum } from '@graphprotocol/graph-ts';
import { Depositor } from '../generated/schema';
import { ZERO_BD, logCritical } from '@enzymefinance/subgraph-utils';
import { activeDepositorsCounterId, depositorsCounterId, increaseCounter } from './Counter';

export function useDepositor(depositorAddress: Address): Depositor {
  let depositor = Depositor.load(depositorAddress);

  if (depositor == null) {
    logCritical('Failed to load depositor {}.', [depositorAddress.toString()]);
  }

  return depositor as Depositor;
}

export function ensureDepositor(depositorAddress: Address, event: ethereum.Event): Depositor {
  let depositor = Depositor.load(depositorAddress);
  let timestamp = event.block.timestamp.toI32();

  if (depositor != null) {
    return depositor;
  }

  depositor = new Depositor(depositorAddress);
  depositor.shares = ZERO_BD;
  depositor.amount = ZERO_BD;
  depositor.createdAt = timestamp;
  depositor.updatedAt = timestamp;
  depositor.save();

  increaseCounter(depositorsCounterId, timestamp);
  increaseCounter(activeDepositorsCounterId, timestamp);

  return depositor as Depositor;
}
