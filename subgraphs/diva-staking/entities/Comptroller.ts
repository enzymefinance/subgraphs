import { Address } from '@graphprotocol/graph-ts';
import { Comptroller } from '../generated/schema';
import { logCritical } from '@enzymefinance/subgraph-utils';

export function createComptroller(comptroller: Address, vault: Address): Comptroller {
  let comp = new Comptroller(comptroller.toHex());

  comp.vault = vault;
  comp.save();

  return comp;
}

export function useComptroller(comptrollerAddress: Address): Comptroller {
  let comptroller = Comptroller.load(comptrollerAddress.toHex());
  if (comptroller == null) {
    logCritical('Failed to load comptroller {}.', [comptrollerAddress.toHex()]);
  }

  return comptroller as Comptroller;
}
