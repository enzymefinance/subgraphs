import { log } from '@graphprotocol/graph-ts';
import { ensureAsset } from '../entities/Asset';
import { updateExternalPosition, updateTrackedAsset } from '../entities/Holding';
import {
  TrackedAssetAdded,
  TrackedAssetRemoved,
  ExternalPositionAdded,
  ExternalPositionRemoved,
} from '../generated/AssetTrackingVaultContract';
import { Asset, Vault } from '../generated/schema';

export function handleTrackedAssetAdded(event: TrackedAssetAdded): void {
  let vault = Vault.load(event.address.toHex());
  if (vault == null) {
    log.error('Missing vault {}', [event.address.toHex()]);
    return;
  }

  let asset = ensureAsset(event.params.asset);
  if (asset == null) {
    log.error('Missing asset {}', [event.params.asset.toHex()]);
    return;
  }

  let holding = updateTrackedAsset(vault as Vault, asset as Asset, event.block.timestamp, true);
  holding.tracked = true;
  holding.save();
}

export function handleTrackedAssetRemoved(event: TrackedAssetRemoved): void {
  let vault = Vault.load(event.address.toHex());
  if (vault == null) {
    log.error('Missing vault {}', [event.address.toHex()]);
    return;
  }

  let asset = ensureAsset(event.params.asset);
  if (asset == null) {
    log.error('Missing asset {}', [event.params.asset.toHex()]);
    return;
  }

  let holding = updateTrackedAsset(vault as Vault, asset as Asset, event.block.timestamp, false);
  holding.tracked = false;
  holding.save();
}

export function handleExternalPositionAdded(event: ExternalPositionAdded): void {
  let vault = Vault.load(event.address.toHex());
  if (vault == null) {
    log.error('Missing vault {}', [event.address.toHex()]);
    return;
  }

  let asset = ensureAsset(event.params.externalPosition);
  if (asset == null) {
    log.error('Missing asset {}', [event.params.externalPosition.toHex()]);
    return;
  }

  let holding = updateExternalPosition(vault as Vault, asset as Asset, event.block.timestamp, true);
  holding.external = true;
  holding.save();
}

export function handleExternalPositionRemoved(event: ExternalPositionRemoved): void {
  let vault = Vault.load(event.address.toHex());
  if (vault == null) {
    log.error('Missing vault {}', [event.address.toHex()]);
    return;
  }

  let asset = ensureAsset(event.params.externalPosition);
  if (asset == null) {
    log.error('Missing asset {}', [event.params.externalPosition.toHex()]);
    return;
  }

  let holding = updateExternalPosition(vault as Vault, asset as Asset, event.block.timestamp, false);
  holding.external = false;
  holding.save();
}
