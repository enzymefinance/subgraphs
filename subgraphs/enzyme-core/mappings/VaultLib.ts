import { Address } from '@graphprotocol/graph-ts';
import { ZERO_ADDRESS } from '../../../utils/constants';
import { arrayDiff, arrayUnique } from '../../../utils/utils/array';
import { uniqueEventId } from '../../../utils/utils/id';
import { toBigDecimal } from '../../../utils/utils/math';
import { ensureAccount, ensureManager } from '../entities/Account';
import { ensureAsset } from '../entities/Asset';
import { trackCalculationState } from '../entities/CalculationState';
import { trackPortfolioState } from '../entities/PortfolioState';
import { ensureTransaction } from '../entities/Transaction';
import { useVault } from '../entities/Vault';
import {
  AccessorSetEvent,
  ApprovalEvent,
  AssetWithdrawnEvent,
  MigratorSetEvent,
  OwnerSetEvent,
  TrackedAssetAddedEvent,
  TrackedAssetRemovedEvent,
  TransferEvent,
  VaultLibSetEvent,
} from '../generated/schema';
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

export function handleAccessorSet(event: AccessorSet): void {
  let accessorSet = new AccessorSetEvent(uniqueEventId(event));
  accessorSet.vault = useVault(event.address.toHex()).id;
  accessorSet.prevAccessor = event.params.prevAccessor.toHex();
  accessorSet.nextAccessor = event.params.nextAccessor.toHex();
  accessorSet.transaction = ensureTransaction(event).id;
  accessorSet.timestamp = event.block.timestamp;
  accessorSet.save();
}

export function handleAssetWithdrawn(event: AssetWithdrawn): void {
  let withdrawal = new AssetWithdrawnEvent(uniqueEventId(event));
  withdrawal.asset = ensureAsset(event.params.asset).id;
  withdrawal.vault = useVault(event.address.toHex()).id;
  withdrawal.timestamp = event.block.timestamp;
  withdrawal.transaction = ensureTransaction(event).id;
  withdrawal.target = event.params.target.toHex();
  withdrawal.amount = toBigDecimal(event.params.amount);
  withdrawal.save();
}

export function handleMigratorSet(event: MigratorSet): void {
  let migratorSet = new MigratorSetEvent(uniqueEventId(event));
  migratorSet.vault = useVault(event.address.toHex()).id;
  migratorSet.timestamp = event.block.timestamp;
  migratorSet.transaction = ensureTransaction(event).id;
  migratorSet.prevMigrator = ensureAccount(event.params.prevMigrator, event).id;
  migratorSet.nextMigrator = ensureAccount(event.params.nextMigrator, event).id;
  migratorSet.save();
}

export function handleOwnerSet(event: OwnerSet): void {
  let ownerSet = new OwnerSetEvent(uniqueEventId(event));
  ownerSet.vault = useVault(event.address.toHex()).id;
  ownerSet.timestamp = event.block.timestamp;
  ownerSet.transaction = ensureTransaction(event).id;

  if (!event.params.prevOwner.equals(ZERO_ADDRESS)) {
    ownerSet.prevOwner = ensureManager(event.params.prevOwner, event).id;
  }

  ownerSet.nextOwner = ensureManager(event.params.nextOwner, event).id;
  ownerSet.save();
}

export function handleTrackedAssetAdded(event: TrackedAssetAdded): void {
  let vault = useVault(event.address.toHex());
  let asset = ensureAsset(event.params.asset);

  let trackedAssetAddition = new TrackedAssetAddedEvent(uniqueEventId(event));
  trackedAssetAddition.asset = asset.id;
  trackedAssetAddition.vault = vault.id;
  trackedAssetAddition.timestamp = event.block.timestamp;
  trackedAssetAddition.transaction = ensureTransaction(event).id;
  trackedAssetAddition.save();

  vault.trackedAssets = arrayUnique<string>(vault.trackedAssets.concat([asset.id]));
  vault.save();

  trackPortfolioState(vault, event, trackedAssetAddition);
  trackCalculationState(vault, event, trackedAssetAddition);
}

export function handleTrackedAssetRemoved(event: TrackedAssetRemoved): void {
  let vault = useVault(event.address.toHex());
  let asset = ensureAsset(event.params.asset);

  let trackedAssetRemoval = new TrackedAssetRemovedEvent(uniqueEventId(event));
  trackedAssetRemoval.asset = asset.id;
  trackedAssetRemoval.vault = vault.id;
  trackedAssetRemoval.timestamp = event.block.timestamp;
  trackedAssetRemoval.account = ensureAccount(Address.fromString(vault.manager), event).id;
  trackedAssetRemoval.transaction = ensureTransaction(event).id;
  trackedAssetRemoval.save();

  vault.trackedAssets = arrayDiff<string>(vault.trackedAssets, [asset.id]);
  vault.save();

  trackPortfolioState(vault, event, trackedAssetRemoval);
  trackCalculationState(vault, event, trackedAssetRemoval);
}

export function handleVaultLibSet(event: VaultLibSet): void {
  let vaultLibSet = new VaultLibSetEvent(uniqueEventId(event));
  vaultLibSet.vault = useVault(event.address.toHex()).id;
  vaultLibSet.timestamp = event.block.timestamp;
  vaultLibSet.transaction = ensureTransaction(event).id;
  vaultLibSet.prevVaultLib = event.params.prevVaultLib.toHex();
  vaultLibSet.nextVaultLib = event.params.nextVaultLib.toHex();
  vaultLibSet.save();
}

export function handleApproval(event: Approval): void {
  let approval = new ApprovalEvent(uniqueEventId(event));
  approval.vault = useVault(event.address.toHex()).id;
  approval.timestamp = event.block.timestamp;
  approval.transaction = ensureTransaction(event).id;
  approval.owner = event.params.owner.toHex();
  approval.spender = event.params.spender.toHex();
  approval.value = toBigDecimal(event.params.value);
  approval.save();
}

export function handleTransfer(event: Transfer): void {
  let transfer = new TransferEvent(uniqueEventId(event));
  transfer.vault = useVault(event.address.toHex()).id;
  transfer.timestamp = event.block.timestamp;
  transfer.transaction = ensureTransaction(event).id;
  transfer.from = event.params.from.toHex();
  transfer.to = event.params.to.toHex();
  transfer.amount = toBigDecimal(event.params.value);
  transfer.save();
}
