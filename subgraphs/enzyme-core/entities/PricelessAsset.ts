import { uniqueEventId } from '@enzymefinance/subgraph-utils';
import { ethereum } from '@graphprotocol/graph-ts';
import { Asset, PricelessAssetBypass, PricelessAssetTimelock, Vault } from '../generated/schema';
import { getActivityCounter } from './Counter';

export function pricelessAssetTimelockId(vault: Vault, policyId: string, asset: Asset, event: ethereum.Event): string {
  return vault.id + '/' + policyId + '/' + asset.id + '/' + uniqueEventId(event);
}

export function createPricelessAssetTimelock(
  vault: Vault,
  policyId: string,
  asset: Asset,
  event: ethereum.Event,
): PricelessAssetTimelock {
  let id = pricelessAssetTimelockId(vault, policyId, asset, event);
  let timelock = new PricelessAssetTimelock(id);
  timelock.vault = vault.id;
  timelock.policy = policyId;
  timelock.asset = asset.id;
  timelock.timestamp = event.block.timestamp.toI32();
  timelock.activityCounter = getActivityCounter();
  timelock.activityCategories = ['Vault'];
  timelock.activityType = 'VaultSettings';
  timelock.save();

  return timelock;
}

export function pricelessAssetBypassId(vault: Vault, policyId: string, asset: Asset, event: ethereum.Event): string {
  return vault.id + '/' + policyId + '/' + asset.id + '/' + uniqueEventId(event);
}
export function createPricelessAssetBypass(
  vault: Vault,
  policyId: string,
  asset: Asset,
  event: ethereum.Event,
): PricelessAssetBypass {
  let id = pricelessAssetBypassId(vault, policyId, asset, event);
  let timelock = new PricelessAssetBypass(id);
  timelock.vault = vault.id;
  timelock.policy = policyId;
  timelock.asset = asset.id;
  timelock.timestamp = event.block.timestamp.toI32();
  timelock.activityCounter = getActivityCounter();
  timelock.activityCategories = ['Vault'];
  timelock.activityType = 'VaultSettings';
  timelock.save();

  return timelock;
}
