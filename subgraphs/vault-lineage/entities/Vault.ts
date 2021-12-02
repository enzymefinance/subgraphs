import { Address, ethereum } from '@graphprotocol/graph-ts';
import { Vault } from '../generated/schema';
import { getVaultCounter } from './Counter';

export function getOrCreateVault(address: Address, event: ethereum.Event): Vault {
  let id = address.toHex();
  let vault = Vault.load(id);
  if (vault == null) {
    vault = new Vault(id);
    vault.block = event.block.number.toI32();
    vault.timestamp = event.block.timestamp.toI32();
    vault.name = '';
    vault.creator = '';
    vault.release = '';
    vault.comptroller = '';
    vault.counter = getVaultCounter();
    vault.save();
  }

  return vault;
}
