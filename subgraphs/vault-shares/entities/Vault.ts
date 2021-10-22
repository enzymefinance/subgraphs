import { ZERO_BD } from '@enzymefinance/subgraph-utils';
import { Address } from '@graphprotocol/graph-ts';
import { Vault } from '../generated/schema';

export function getOrCreateVault(address: Address): Vault {
  let id = address.toHex();
  let vault = Vault.load(id);
  if (vault == null) {
    vault = new Vault(id);
    vault.supply = ZERO_BD;
    vault.save();
  }

  return vault;
}
