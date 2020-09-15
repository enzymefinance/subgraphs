import { Address } from '@graphprotocol/graph-ts';
import { VaultLib } from '../generated/schema';
import { logCritical } from '../utils/logCritical';

export function useComptroller(id: string): VaultLib {
  let vaultLib = VaultLib.load(id);
  if (vaultLib == null) {
    logCritical('Failed to load comptroller {}.', [id]);
  }

  return vaultLib as VaultLib;
}

export function ensureComptroller(address: Address): VaultLib {
  let vaultLib = VaultLib.load(address.toHex()) as VaultLib;
  if (vaultLib) {
    return vaultLib;
  }

  vaultLib = new VaultLib(address.toHex());
  vaultLib.save();

  return vaultLib;
}
