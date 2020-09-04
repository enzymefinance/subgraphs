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
import { dataSource } from '@graphprotocol/graph-ts';
import { useFund } from '../entities/Fund';
import { ensureAsset } from '../entities/Asset';
import { TrackedAssetAddition, TrackedAssetRemoval } from '../generated/schema';
import { createContractEvent } from '../entities/Event';

export function handleAccessorSet(event: AccessorSet): void {}
export function handleApproval(event: Approval): void {}
export function handleAssetWithdrawn(event: AssetWithdrawn): void {}
export function handleMigratorSet(event: MigratorSet): void {}
export function handleOwnerSet(event: OwnerSet): void {}

export function handleTrackedAssetAdded(event: TrackedAssetAdded): void {
  let id = event.transaction.hash.toHex() + '-' + event.logIndex.toString();
  let trackedAssetAddition = new TrackedAssetAddition(id);
  let fund = useFund(dataSource.context().getString('vaultProxy'));
  trackedAssetAddition.asset = ensureAsset(event.params.asset).id;
  trackedAssetAddition.fund = fund.id;
  trackedAssetAddition.timestamp = event.block.timestamp;
  trackedAssetAddition.save();
  createContractEvent('TrackedAssetAdded', event);
}

export function handleTrackedAssetRemoved(event: TrackedAssetRemoved): void {
  let id = event.transaction.hash.toHex() + '-' + event.logIndex.toString();
  let trackedAssetRemoval = new TrackedAssetRemoval(id);
  let fund = useFund(dataSource.context().getString('vaultProxy'));
  trackedAssetRemoval.asset = ensureAsset(event.params.asset).id;
  trackedAssetRemoval.fund = fund.id;
  trackedAssetRemoval.timestamp = event.block.timestamp;
  trackedAssetRemoval.save();
  createContractEvent('TrackedAssetRemoved', event);
}

export function handleTransfer(event: Transfer): void {}
export function handleVaultLibSet(event: VaultLibSet): void {}
