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
import {
  TrackedAssetAddition,
  TrackedAssetRemoval,
  AssetWithdrawal,
  AccessorSetEvent,
  ApprovalGranted,
} from '../generated/schema';
import { arrayUnique } from '../utils/arrayUnique';
import { arrayDiff } from '../utils/arrayDiff';
import { genericId } from '../utils/genericId';
import { ensureTransaction } from '../entities/Transaction';
import { ensureAccount } from '../entities/Account';
import { Address } from '@graphprotocol/graph-ts';
import { ensureContract } from '../entities/Contract';
import { ensureComptroller } from '../entities/Comptroller';
import { useAdapter } from '../entities/Adapter';

export function handleAccessorSet(event: AccessorSet): void {
  let id = genericId(event);
  let accessorSet = new AccessorSetEvent(id);
  accessorSet.contract = ensureContract(event.address, 'VaultLib', event.block.timestamp).id;
  accessorSet.fund = useFund(event.address.toHex()).id;
  accessorSet.account = ensureAccount(Address.fromString(ensureTransaction(event).from)).id;
  accessorSet.prevAccessor = ensureComptroller(event.params.prevAccessor).id;
  accessorSet.nextAccessor = ensureComptroller(event.params.nextAccessor).id;
  accessorSet.transaction = ensureTransaction(event).id;
  accessorSet.save();
}

export function handleApproval(event: Approval): void {
  let id = genericId(event);
  let approval = new ApprovalGranted(id);
  approval.fund = useFund(event.address.toHex()).id;
  approval.account = ensureAccount(Address.fromString(ensureTransaction(event).from)).id;
  approval.contract = ensureContract(event.address, 'VaultLib', event.block.timestamp).id;
  approval.timestamp = event.block.timestamp;
  approval.transaction = ensureTransaction(event).id;
  approval.owner = ensureAccount(Address.fromString(ensureTransaction(event).from)).id;
  approval.spender = useAdapter(event.params.spender.toHex()).id
  approval.value = event.params.value
}

export function handleAssetWithdrawn(event: AssetWithdrawn): void {
  let id = genericId(event);
  let address = Address.fromString(ensureTransaction(event).from);
  let withdrawal = new AssetWithdrawal(id);
  withdrawal.asset = ensureAsset(event.params.asset).id;
  withdrawal.fund = useFund(event.address.toHex()).id;
  withdrawal.account = ensureAccount(address).id;
  withdrawal.timestamp = event.block.timestamp;
  withdrawal.transaction = ensureTransaction(event).id;
  withdrawal.target = event.params.target.toHex();
  withdrawal.amount = event.params.amount;
  withdrawal.save();
}

export function handleMigratorSet(event: MigratorSet): void {}
export function handleOwnerSet(event: OwnerSet): void {}

export function handleTrackedAssetAdded(event: TrackedAssetAdded): void {
  let id = genericId(event);
  let fund = useFund(event.address.toHex());
  let asset = ensureAsset(event.params.asset);
  let trackedAssetAddition = new TrackedAssetAddition(id);
  trackedAssetAddition.asset = asset.id;
  trackedAssetAddition.fund = fund.id;
  trackedAssetAddition.account = ensureAccount(Address.fromString(fund.manager)).id;
  trackedAssetAddition.contract = ensureContract(event.address, 'VaultLib', event.block.timestamp).id;
  trackedAssetAddition.timestamp = event.block.timestamp;
  trackedAssetAddition.transaction = ensureTransaction(event).id;
  trackedAssetAddition.save();

  fund.trackedAssets = arrayUnique<string>(fund.trackedAssets.concat([asset.id]));
  fund.save();
}

export function handleTrackedAssetRemoved(event: TrackedAssetRemoved): void {
  let id = genericId(event);
  let fund = useFund(event.address.toHex());
  let asset = ensureAsset(event.params.asset);
  let trackedAssetRemoval = new TrackedAssetRemoval(id);
  trackedAssetRemoval.asset = asset.id;
  trackedAssetRemoval.fund = fund.id;
  trackedAssetRemoval.timestamp = event.block.timestamp;
  trackedAssetRemoval.account = ensureAccount(Address.fromString(fund.manager)).id;
  trackedAssetRemoval.contract = ensureContract(event.address, 'VaultLib', event.block.timestamp).id;
  trackedAssetRemoval.transaction = ensureTransaction(event).id;
  trackedAssetRemoval.save();

  fund.trackedAssets = arrayDiff<string>(fund.trackedAssets, [asset.id]);
  fund.save();
}

export function handleTransfer(event: Transfer): void {}
export function handleVaultLibSet(event: VaultLibSet): void {}
