import { log } from '@graphprotocol/graph-ts';
import { getOrCreateAsset } from '../entities/Asset';
import { updateTrackedAsset } from '../entities/Balance';
import { TrackedAssetAdded, TrackedAssetRemoved } from '../generated/contracts/VaultEvents';
import { Vault } from '../generated/schema';

export function handleTrackedAssetAdded(event: TrackedAssetAdded): void {
  let vault = Vault.load(event.address.toHex());
  if (vault == null) {
    log.error('Missing vault {}', [event.address.toHex()]);
    return;
  }

  let asset = getOrCreateAsset(event.params.asset);
  if (asset == null) {
    log.error('Missing asset {}', [event.params.asset.toHex()]);
    return;
  }

  updateTrackedAsset(vault, asset, event, true);
}

export function handleTrackedAssetRemoved(event: TrackedAssetRemoved): void {
  let vault = Vault.load(event.address.toHex());
  if (vault == null) {
    log.error('Missing vault {}', [event.address.toHex()]);
    return;
  }

  let asset = getOrCreateAsset(event.params.asset);
  if (asset == null) {
    log.error('Missing asset {}', [event.params.asset.toHex()]);
    return;
  }

  updateTrackedAsset(vault, asset, event, false);
}