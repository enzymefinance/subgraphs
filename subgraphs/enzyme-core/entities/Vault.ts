import { logCritical } from '@enzymefinance/subgraph-utils';
import { Address, BigInt } from '@graphprotocol/graph-ts';
import { Account, Comptroller, Release, Vault, VaultCreated } from '../generated/schema';
import { getActivityCounter, getVaultCounter } from './Counter';

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
  vault.symbol = 'ENZF';
  vault.counter = getVaultCounter();
  vault.inception = inception.toI32();
  vault.release = release.id;
  vault.comptroller = comptroller.id;
  vault.owner = owner.id;
  vault.creator = creator.id;
  vault.assetManagers = new Array<string>();
  vault.trackedAssets = new Array<string>();
  vault.freelyTransferableShares = false;
  vault.depositCount = 0;
  vault.lastAssetUpdate = 0;
  vault.save();

  let activity = new VaultCreated(vault.id);
  activity.vault = vault.id;
  activity.timestamp = inception.toI32();
  activity.creator = creator.id;
  activity.owner = owner.id;
  activity.activityCounter = getActivityCounter();
  activity.activityCategories = ['Vault'];
  activity.activityType = 'VaultSettings';
  activity.save();

  return vault;
}

export function useVault(id: string): Vault {
  let vault = Vault.load(id);
  if (vault == null) {
    logCritical('Failed to load vault {}.', [id]);
  }

  return vault as Vault;
}

export function isVault(id: string): boolean {
  return Vault.load(id) != null;
}
