import { Address, ethereum } from '@graphprotocol/graph-ts';
import { Comptroller, Release, Vault } from '../generated/schema';
import { getComptrollerCounter } from './Counter';

export function getOrCreateComptroller(
  address: Address,
  vault: Vault,
  release: Release,
  event: ethereum.Event,
): Comptroller {
  let id = address.toHex();
  let comptroller = Comptroller.load(id);
  if (comptroller == null) {
    comptroller = new Comptroller(id);
    comptroller.vault = vault.id;
    comptroller.from = event.block.number.toI32();
    comptroller.to = 0;
    comptroller.release = release.id;
    comptroller.counter = getComptrollerCounter();
    comptroller.save();
  }

  return comptroller;
}
