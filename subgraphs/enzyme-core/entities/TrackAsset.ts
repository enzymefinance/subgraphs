import { uniqueEventId } from '@enzymefinance/subgraph-utils';
import { ethereum } from '@graphprotocol/graph-ts';
import { Asset, TrackAsset, Vault } from '../generated/schema';
import { getActivityCounter } from './Counter';

export function trackAsset(vault: Vault, asset: Asset, type: string, event: ethereum.Event): void {
  let trackAsset = new TrackAsset(uniqueEventId(event));
  trackAsset.vault = vault.id;
  trackAsset.asset = asset.id;
  trackAsset.timestamp = event.block.timestamp.toI32();
  trackAsset.type = type;
  trackAsset.activityCounter = getActivityCounter();
  trackAsset.activityCategories = ['Vault'];
  trackAsset.activityType = 'Trade';
  trackAsset.save();

  vault.lastAssetUpdate = event.block.timestamp.toI32();
  vault.save();
}
