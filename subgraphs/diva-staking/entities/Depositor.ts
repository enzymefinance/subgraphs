import { BigInt, Address, ethereum } from '@graphprotocol/graph-ts';
import { Depositor } from '../generated/schema';

export function createOrUpdateDepositor(
  depositorAddress: Address,
  tranches: { amount: BigInt; id: number }[],
  event: ethereum.Event,
): Depositor {
  let depositor = Depositor.load(depositorAddress.toHex());

  if (depositor) {
    let amounts = depositor.amounts;
    let trancheIds = depositor.trancheIds;

    depositor.updatedAt = event.block.timestamp.toI32();

    depositor.save();
  }

  return createDepositor(depositorAddress, tranches, event);
}

export function createDepositor(
  depositorAddress: Address,
  tranches: { amount: BigInt; id: number }[],
  event: ethereum.Event,
): Depositor {
  let depositor = new Depositor(depositorAddress.toHex());

  depositor.amounts = tranches.map<BigInt>((tranche) => tranche.amount);
  depositor.trancheIds = tranches.map<number>((tranche) => tranche.id);
  depositor.createdAt = event.block.timestamp.toI32();
  depositor.updatedAt = event.block.timestamp.toI32();

  depositor.save();

  return depositor;
}
