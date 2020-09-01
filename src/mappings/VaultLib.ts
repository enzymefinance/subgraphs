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

export function handleAccessorSet(event: AccessorSet): void {}
export function handleApproval(event: Approval): void {}
export function handleAssetWithdrawn(event: AssetWithdrawn): void {}
export function handleMigratorSet(event: MigratorSet): void {}
export function handleOwnerSet(event: OwnerSet): void {}
export function handleTrackedAssetAdded(event: TrackedAssetAdded): void {}
export function handleTrackedAssetRemoved(event: TrackedAssetRemoved): void {}
export function handleTransfer(event: Transfer): void {}
export function handleVaultLibSet(event: VaultLibSet): void {}
