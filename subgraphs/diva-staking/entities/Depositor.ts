import { BigInt, Address, ethereum } from '@graphprotocol/graph-ts';
import { Depositor } from '../generated/schema';
import { Tranche, tranchesConfig } from '../utils/tranches';

export function updateDepositor(depositor: Depositor, tranches: Tranche[], event: ethereum.Event): Depositor {
  let trancheAmounts = depositor.trancheAmounts;
  for (let i = 0; i < tranches.length; i++) {
    let tranche = tranches[i];

    // tranche.amount can be on minus when redeeming
    trancheAmounts[tranche.id as i32] = trancheAmounts[tranche.id as i32].plus(tranche.amount);
  }
  depositor.trancheAmounts = trancheAmounts;
  depositor.updatedAt = event.block.timestamp.toI32();

  depositor.save();

  return depositor;
}

export function createDepositor(depositorAddress: Address, tranches: Tranche[], event: ethereum.Event): Depositor {
  let depositor = new Depositor(depositorAddress.toHex());

  // init array with zeroes
  let trancheAmounts = tranchesConfig.map<BigInt>(() => BigInt.fromI32(0));

  for (let i = 0; i < tranches.length; i++) {
    let tranche = tranches[i];

    trancheAmounts[tranche.id as i32] = tranche.amount;
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
