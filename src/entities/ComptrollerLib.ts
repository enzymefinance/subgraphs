import { Address } from '@graphprotocol/graph-ts';
import { ComptrollerLib } from '../generated/schema';
import { logCritical } from '../utils/logCritical';

export function useComptrollerLib(id: string): ComptrollerLib {
  let comptrollerLib = ComptrollerLib.load(id) as ComptrollerLib;

  if (comptrollerLib == null) {
    logCritical('Failed to load comptrollerLib {}.', [id]);
  }

  return comptrollerLib;
}

export function ensureComptrollerLib(address: Address): ComptrollerLib {
  let comptrollerLib = ComptrollerLib.load(address.toHex()) as ComptrollerLib;
  if (comptrollerLib) {
    return comptrollerLib;
  }

  comptrollerLib = new ComptrollerLib(address.toHex());
  comptrollerLib.save();

  return comptrollerLib;
}
