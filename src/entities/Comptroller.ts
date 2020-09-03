import { Address } from '@graphprotocol/graph-ts';
import { Comptroller } from '../generated/schema';
import { logCritical } from '../utils/logCritical';

export function useComptroller(id: string): Comptroller {
  let comptroller = Comptroller.load(id);
  if (comptroller == null) {
    logCritical('Failed to load comptroller {}.', [id]);
  }

  return comptroller as Comptroller;
}

export function ensureComptroller(address: Address): Comptroller {
  let comptroller = Comptroller.load(address.toHex()) as Comptroller;
  if (comptroller) {
    return comptroller;
  }

  comptroller = new Comptroller(address.toHex());
  comptroller.save();

  return comptroller;
}
