import { BigInt, Address, ethereum } from '@graphprotocol/graph-ts';
import { Depositor } from '../generated/schema';
import { tranchesConfig } from '../utils/tranches';

export function createOrUpdateDepositor(
  depositorAddress: Address,
  tranches: { amount: BigInt; id: number }[],
  event: ethereum.Event,
): Depositor {
  let depositor = getDepositor(depositorAddress);

  if (depositor) {
    return updateDepositor(depositor, tranches, event);
  }

  return createDepositor(depositorAddress, tranches, event);
}

export function updateDepositor(
  depositor: Depositor,
  tranches: { amount: BigInt; id: number }[],
  event: ethereum.Event,
): Depositor {
  let trancheAmounts = depositor.trancheAmounts;
  for (let i = 0; i < tranches.length; i++) {
    let tranche = tranches[i];

    // tranche.amount can be on minus when redeeming
    trancheAmounts[tranche.id] = trancheAmounts[tranche.id].plus(tranche.amount);
  }
  depositor.trancheAmounts = trancheAmounts;
  depositor.updatedAt = event.block.timestamp.toI32();

  depositor.save();

  return depositor;
}

export function createDepositor(
  depositorAddress: Address,
  tranches: { amount: BigInt; id: number }[],
  event: ethereum.Event,
): Depositor {
  let depositor = new Depositor(depositorAddress.toHex());

  // init array with zeroes
  let trancheAmounts = tranchesConfig.map<BigInt>(() => BigInt.fromI32(0));

  for (let i = 0; i < tranches.length; i++) {
    let tranche = tranches[i];

    trancheAmounts[tranche.id] = tranche.amount;
  }

  depositor.trancheAmounts = trancheAmounts;
  depositor.createdAt = event.block.timestamp.toI32();
  depositor.updatedAt = event.block.timestamp.toI32();

  depositor.save();

  return depositor;
}

export function getDepositor(depositorAddress: Address): Depositor | null {
  let depositor = Depositor.load(depositorAddress.toHex());
  return depositor;
}
