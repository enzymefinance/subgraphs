import { Address } from '@graphprotocol/graph-ts';
import { Comptroller } from '../generated/schema';

export function createComptroller(comptroller: Address, vault: Address): Comptroller {
  let comp = new Comptroller(comptroller.toString());

  comp.vault = vault;
  comp.save();

  return comp;
}
