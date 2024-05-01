import { uniqueEventId } from '@enzymefinance/subgraph-utils';
import { ethereum } from '@graphprotocol/graph-ts';
import { Asset, TrackedAssetAdded, Vault } from '../generated/schema';
import { getActivityCounter } from './Counter';

export function trackedAssetAdded(vault: Vault, asset: Asset, event: ethereum.Event): void {
  let trackAsset = new TrackedAssetAdded(uniqueEventId(event));
  trackAsset.vault = vault.id;
  trackAsset.asset = asset.id;
  trackAsset.timestamp = event.block.timestamp.toI32();
  trackAsset.activityCounter = getActivityCounter();
  trackAsset.activityCategories = ['Vault'];
  trackAsset.activityType = 'TrackedAssetAdded';
  trackAsset.save();

  vault.lastAssetUpdate = event.block.timestamp.toI32();
  vault.save();
}
