import { Address, ethereum } from '@graphprotocol/graph-ts';
import { Vault } from '../generated/schema';
import { getVaultCounter } from './Counter';

export function getOrCreateVault(address: Address, event: ethereum.Event): Vault {
  let id = address.toHex();
  let vault = Vault.load(id);
  if (vault == null) {
    vault = new Vault(id);
    vault.inception = event.block.number.toI32();
    vault.release = '';
    vault.comptroller = '';
    vault.counter = getVaultCounter();
    vault.save();
  }

  return vault;
}
