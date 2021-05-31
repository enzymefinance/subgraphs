import { Address } from '@graphprotocol/graph-ts';
import { zeroAddress } from '../constants';
import { ensureAccount, ensureManager } from '../entities/Account';
import { ensureAsset } from '../entities/Asset';
import { useFund } from '../entities/Fund';
import { trackPortfolioState } from '../entities/PortfolioState';
import { ensureTransaction } from '../entities/Transaction';
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
import { arrayDiff } from '../utils/arrayDiff';
import { arrayUnique } from '../utils/arrayUnique';
import { genericId } from '../utils/genericId';
import { toBigDecimal } from '../utils/toBigDecimal';

export function handleAccessorSet(event: AccessorSet): void {
  let accessorSet = new AccessorSetEvent(genericId(event));
  accessorSet.fund = useFund(event.address.toHex()).id;
  accessorSet.prevAccessor = event.params.prevAccessor.toHex();
  accessorSet.nextAccessor = event.params.nextAccessor.toHex();
  accessorSet.transaction = ensureTransaction(event).id;
  accessorSet.timestamp = event.block.timestamp;
  accessorSet.save();
}

export function handleAssetWithdrawn(event: AssetWithdrawn): void {
  let withdrawal = new AssetWithdrawnEvent(genericId(event));
  withdrawal.asset = ensureAsset(event.params.asset).id;
  withdrawal.fund = useFund(event.address.toHex()).id;
  withdrawal.timestamp = event.block.timestamp;
  withdrawal.transaction = ensureTransaction(event).id;
  withdrawal.target = event.params.target.toHex();
  withdrawal.amount = toBigDecimal(event.params.amount);
  withdrawal.save();
}

export function handleMigratorSet(event: MigratorSet): void {
  let migratorSet = new MigratorSetEvent(genericId(event));
  migratorSet.fund = useFund(event.address.toHex()).id;
  migratorSet.timestamp = event.block.timestamp;
  migratorSet.transaction = ensureTransaction(event).id;
  migratorSet.prevMigrator = ensureAccount(event.params.prevMigrator, event).id;
  migratorSet.nextMigrator = ensureAccount(event.params.nextMigrator, event).id;
  migratorSet.save();
}

export function handleOwnerSet(event: OwnerSet): void {
  let ownerSet = new OwnerSetEvent(genericId(event));
  ownerSet.fund = useFund(event.address.toHex()).id;
  ownerSet.timestamp = event.block.timestamp;
  ownerSet.transaction = ensureTransaction(event).id;

  if (!event.params.prevOwner.equals(zeroAddress)) {
    ownerSet.prevOwner = ensureManager(event.params.prevOwner, event).id;
  }

  ownerSet.nextOwner = ensureManager(event.params.nextOwner, event).id;
  ownerSet.save();
}

export function handleTrackedAssetAdded(event: TrackedAssetAdded): void {
  let fund = useFund(event.address.toHex());
  let asset = ensureAsset(event.params.asset);

  let trackedAssetAddition = new TrackedAssetAddedEvent(genericId(event));
  trackedAssetAddition.asset = asset.id;
  trackedAssetAddition.fund = fund.id;
  trackedAssetAddition.timestamp = event.block.timestamp;
  trackedAssetAddition.transaction = ensureTransaction(event).id;
  trackedAssetAddition.save();

  fund.trackedAssets = arrayUnique<string>(fund.trackedAssets.concat([asset.id]));
  fund.save();

  trackPortfolioState(fund, event, trackedAssetAddition);
}

export function handleTrackedAssetRemoved(event: TrackedAssetRemoved): void {
  let fund = useFund(event.address.toHex());
  let asset = ensureAsset(event.params.asset);

  let trackedAssetRemoval = new TrackedAssetRemovedEvent(genericId(event));
  trackedAssetRemoval.asset = asset.id;
  trackedAssetRemoval.fund = fund.id;
  trackedAssetRemoval.timestamp = event.block.timestamp;
  trackedAssetRemoval.account = ensureAccount(Address.fromString(fund.manager), event).id;
  trackedAssetRemoval.transaction = ensureTransaction(event).id;
  trackedAssetRemoval.save();

  fund.trackedAssets = arrayDiff<string>(fund.trackedAssets, [asset.id]);
  fund.save();

  trackPortfolioState(fund, event, trackedAssetRemoval);
}

export function handleVaultLibSet(event: VaultLibSet): void {
  let vaultLibSet = new VaultLibSetEvent(genericId(event));
  vaultLibSet.fund = useFund(event.address.toHex()).id;
  vaultLibSet.timestamp = event.block.timestamp;
  vaultLibSet.transaction = ensureTransaction(event).id;
  vaultLibSet.prevVaultLib = event.params.prevVaultLib.toHex();
  vaultLibSet.nextVaultLib = event.params.nextVaultLib.toHex();
  vaultLibSet.save();
}

export function handleApproval(event: Approval): void {
  let approval = new ApprovalEvent(genericId(event));
  approval.fund = useFund(event.address.toHex()).id;
  approval.timestamp = event.block.timestamp;
  approval.transaction = ensureTransaction(event).id;
  approval.owner = event.params.owner.toHex();
  approval.spender = event.params.spender.toHex();
  approval.value = toBigDecimal(event.params.value);
  approval.save();
}

export function handleTransfer(event: Transfer): void {
  let transfer = new TransferEvent(genericId(event));
  transfer.fund = useFund(event.address.toHex()).id;
  transfer.timestamp = event.block.timestamp;
  transfer.transaction = ensureTransaction(event).id;
  transfer.from = event.params.from.toHex();
  transfer.to = event.params.to.toHex();
  transfer.amount = toBigDecimal(event.params.value);
  transfer.save();
}
