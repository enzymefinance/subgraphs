import { Address, ethereum } from '@graphprotocol/graph-ts';
import { VaultLibSdk } from '../generated/contracts/VaultLibSdk';
import { Vault } from '../generated/schema';
import { getVaultCounter } from './Counter';

export function getOrCreateVault(address: Address, event: ethereum.Event): Vault {
  let id = address.toHex();
  let vault = Vault.load(id);
  if (vault == null) {
    vault = new Vault(id);
    vault.block = event.block.number;
    vault.timestamp = event.block.timestamp.toI32();
    vault.name = '';
    vault.symbol = getVaultSymbol(address);
    vault.creator = '';
    vault.release = '';
    vault.comptroller = '';
    vault.counter = getVaultCounter();
    vault.save();
  }

  return vault;
}

function getVaultSymbol(address: Address): string {
  const contract = VaultLibSdk.bind(address);
  const result = contract.try_symbol();
  if (result.reverted) {
    return 'ENZF';
  }

  return result.value;
}
