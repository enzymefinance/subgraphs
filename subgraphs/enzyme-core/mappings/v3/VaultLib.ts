import { arrayDiff, arrayUnique, ZERO_ADDRESS } from '@enzymefinance/subgraph-utils';
import { ensureOwner } from '../../entities/Account';
import { ensureAsset } from '../../entities/Asset';
import { trackDeposit } from '../../entities/Deposit';
import { useVault } from '../../entities/Vault';
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
} from '../../generated/contracts/VaultLib3Events';
import { trackedAssetAdded } from '../../entities/TrackedAssetAdded';
import { trackedAssetRemoved } from '../../entities/TrackedAssetRemoved';

export function handleAccessorSet(event: AccessorSet): void {}

export function handleAssetWithdrawn(event: AssetWithdrawn): void {}

export function handleMigratorSet(event: MigratorSet): void {
  let vault = useVault(event.address.toHex());
  vault.migrator = event.params.nextMigrator.toHex();
  vault.save();
}

export function handleOwnerSet(event: OwnerSet): void {
  let manager = ensureOwner(event.params.nextOwner, event);

  let vault = useVault(event.address.toHex());
  vault.owner = manager.id;
  vault.save();
}

export function handleTrackedAssetAdded(event: TrackedAssetAdded): void {
  let vault = useVault(event.address.toHex());
  let asset = ensureAsset(event.params.asset);

  vault.trackedAssets = arrayUnique<string>(vault.trackedAssets.concat([asset.id]));
  vault.save();

  trackedAssetAdded(vault, asset, event);
}

export function handleTrackedAssetRemoved(event: TrackedAssetRemoved): void {
  let vault = useVault(event.address.toHex());
  let asset = ensureAsset(event.params.asset);

  vault.trackedAssets = arrayDiff<string>(vault.trackedAssets, [asset.id]);
  vault.save();

  trackedAssetRemoved(vault, asset, event);
}

export function handleVaultLibSet(event: VaultLibSet): void {}

export function handleApproval(event: Approval): void {}

export function handleTransfer(event: Transfer): void {
  if (event.params.from.notEqual(ZERO_ADDRESS)) {
    trackDeposit(event.address, event.params.from, event);
  }

  if (event.params.to.notEqual(ZERO_ADDRESS)) {
    trackDeposit(event.address, event.params.to, event);
  }
}
