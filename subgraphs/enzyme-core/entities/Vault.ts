import { logCritical } from '@enzymefinance/subgraph-utils';
import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts';
import { Account, Comptroller, Release, Vault } from '../generated/schema';

export function createVault(
  address: Address,
  name: string,
  inception: BigInt,
  release: Release,
  comptroller: Comptroller,
  owner: Account,
  creator: Account,
): Vault {
  let vault = new Vault(address.toHex());
  vault.name = name;
  vault.inception = inception.toI32();
  vault.release = release.id;
  vault.comptroller = comptroller.id;
  vault.owner = owner.id;
  vault.creator = creator.id;
  vault.assetManagers = new Array<string>();
  vault.trackedAssets = new Array<string>();
  vault.freelyTransferableShares = false;
  vault.totalSupply = BigDecimal.fromString('0');
  vault.depositCount = 0;
  vault.save();

  return vault;
}

export function useVault(id: string): Vault {
  let vault = Vault.load(id);
  if (vault == null) {
    logCritical('Failed to load fund {}.', [id]);
  }

  return vault as Vault;
}
