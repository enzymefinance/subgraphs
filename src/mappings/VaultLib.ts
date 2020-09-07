import {
  AccessorSet,
  Approval,
  AssetWithdrawn,
  MigratorSet,
  OwnerSet,
  TrackedAssetAdded,
  TrackedAssetRemoved,
  Transfer,
  VaultLibSet,
} from '../generated/VaultLibContract';
import { useFund } from '../entities/Fund';
import { ensureAsset } from '../entities/Asset';
import { TrackedAssetAddition, TrackedAssetRemoval } from '../generated/schema';
import { createContractEvent } from '../entities/ContractEvent';
import { arrayUnique } from '../utils/arrayUnique';
import { arrayDiff } from '../utils/arrayDiff';
import { genericId } from '../utils/genericId';

export function handleAccessorSet(event: AccessorSet): void {}
export function handleApproval(event: Approval): void {}
export function handleAssetWithdrawn(event: AssetWithdrawn): void {}
export function handleMigratorSet(event: MigratorSet): void {}
export function handleOwnerSet(event: OwnerSet): void {}

export function handleTrackedAssetAdded(event: TrackedAssetAdded): void {
  let asset = ensureAsset(event.params.asset);
  let fund = useFund(event.address.toHex());

  let id = genericId(event);
  let trackedAssetAddition = new TrackedAssetAddition(id);
  trackedAssetAddition.asset = asset.id;
  trackedAssetAddition.fund = fund.id;
  trackedAssetAddition.timestamp = event.block.timestamp;
  trackedAssetAddition.save();

  fund.trackedAssets = arrayUnique<string>(fund.trackedAssets.concat([asset.id]));
  fund.save();

  createContractEvent('TrackedAssetAdded', event);
}

export function handleTrackedAssetRemoved(event: TrackedAssetRemoved): void {
  let asset = ensureAsset(event.params.asset);
  let fund = useFund(event.address.toHex());

  let id = genericId(event);
  let trackedAssetRemoval = new TrackedAssetRemoval(id);
  trackedAssetRemoval.asset = asset.id;
  trackedAssetRemoval.fund = fund.id;
  trackedAssetRemoval.timestamp = event.block.timestamp;
  trackedAssetRemoval.save();

  fund.trackedAssets = arrayDiff<string>(fund.trackedAssets, [asset.id]);
  fund.save();

  createContractEvent('TrackedAssetRemoved', event);
}

export function handleTransfer(event: Transfer): void {}
export function handleVaultLibSet(event: VaultLibSet): void {}
