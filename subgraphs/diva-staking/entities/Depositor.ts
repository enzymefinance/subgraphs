import { Address, ethereum, BigDecimal } from '@graphprotocol/graph-ts';
import { Depositor } from '../generated/schema';
import { logCritical } from '@enzymefinance/subgraph-utils';

export function updateDepositor(
  depositor: Depositor,
  shares: BigDecimal,
  amount: BigDecimal,
  event: ethereum.Event,
): Depositor {
  depositor.updatedAt = event.block.timestamp.toI32();
  depositor.shares = depositor.shares.plus(shares);
  depositor.amount = depositor.amount.plus(amount);

  depositor.save();

  return depositor;
}

export function createDepositor(
  depositorAddress: Address,
  shares: BigDecimal,
  amount: BigDecimal,
  event: ethereum.Event,
): Depositor {
  let depositor = new Depositor(depositorAddress);

  depositor.shares = shares;
  depositor.amount = amount;
  depositor.createdAt = event.block.timestamp.toI32();
  depositor.updatedAt = event.block.timestamp.toI32();

  depositor.save();

  return depositor;
}

export function getDepositor(depositorAddress: Address): Depositor | null {
  let depositor = Depositor.load(depositorAddress);
  return depositor;
}

export function useDepositor(depositorAddress: Address): Depositor {
  let depositor = Depositor.load(depositorAddress);
  if (depositor == null) {
    logCritical('Failed to load depositor {}.', [depositorAddress.toString()]);
  }

  return depositor as Depositor;
}

export function ensureDepositor(depositorAddress: Address, event: ethereum.Event): Depositor {
  let depositor = Depositor.load(depositorAddress);
  if (depositor) {
    return depositor;
  }
  depositor = new Depositor(depositorAddress);
  depositor.shares = BigDecimal.zero();
  depositor.amount = BigDecimal.zero();
  depositor.createdAt = event.block.timestamp.toI32();
  depositor.updatedAt = event.block.timestamp.toI32();

  return depositor as Depositor;
}
