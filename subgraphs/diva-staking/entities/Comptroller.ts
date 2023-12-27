import { Address } from '@graphprotocol/graph-ts';
import { Comptroller } from '../generated/schema';

export function createComptroller(comptroller: Address, vault: Address): Comptroller {
  let comp = new Comptroller(comptroller.toHex());

  comp.vault = vault;
  comp.save();

  return comp;
}
