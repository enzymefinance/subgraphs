import { Address, log } from '@graphprotocol/graph-ts';
import { zeroAddress } from '../constants';
import { ensureAccount, ensureManager, useAccount } from '../entities/Account';
import { ensureAsset } from '../entities/Asset';
import { ensureComptroller } from '../entities/Comptroller';
import { ensureContract, useContract } from '../entities/Contract';
import { useFund } from '../entities/Fund';
import { ensureTransaction } from '../entities/Transaction';
import {
  AccessorSetEvent,
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
import { toBigDecimal } from '../utils/tokenValue';

export function handleAccessorSet(event: AccessorSet): void {
  let id = genericId(event);
  let accessorSet = new AccessorSetEvent(id);

  accessorSet.contract = ensureContract(event.address, 'VaultLib', event).id;
  accessorSet.fund = useFund(event.address.toHex()).id;
  accessorSet.account = ensureManager(Address.fromString(ensureTransaction(event).from), event).id;

  if (event.params.prevAccessor != zeroAddress) {
    accessorSet.prevAccessor = ensureComptroller(event.params.prevAccessor).id;
  }
  accessorSet.nextAccessor = ensureComptroller(event.params.nextAccessor).id;
  accessorSet.transaction = ensureTransaction(event).id;
  accessorSet.timestamp = event.block.timestamp;

  accessorSet.save();
}

export function handleAssetWithdrawn(event: AssetWithdrawn): void {
  let id = genericId(event);
  let withdrawal = new AssetWithdrawnEvent(id);
  let address = Address.fromString(ensureTransaction(event).from);

  withdrawal.asset = ensureAsset(event.params.asset).id;
  withdrawal.fund = useFund(event.address.toHex()).id;
  withdrawal.account = ensureManager(address, event).id;
  withdrawal.timestamp = event.block.timestamp;
  withdrawal.transaction = ensureTransaction(event).id;
  withdrawal.target = event.params.target.toHex();
  withdrawal.amount = toBigDecimal(event.params.amount);
  withdrawal.contract = useContract(event.address.toHex()).id;

  withdrawal.save();
}

export function handleMigratorSet(event: MigratorSet): void {
  let id = genericId(event);
  let migratorSet = new MigratorSetEvent(id);

  migratorSet.fund = useFund(event.address.toHex()).id;
  migratorSet.account = ensureManager(Address.fromString(ensureTransaction(event).from), event).id;
  migratorSet.contract = useContract(event.address.toHex()).id;
  migratorSet.timestamp = event.block.timestamp;
  migratorSet.transaction = ensureTransaction(event).id;
  migratorSet.prevMigrator = ensureAccount(event.params.prevMigrator, event).id;
  migratorSet.nextMigrator = ensureAccount(event.params.nextMigrator, event).id;

  migratorSet.save();
}

export function handleOwnerSet(event: OwnerSet): void {
  let id = genericId(event);
  let ownerSet = new OwnerSetEvent(id);
  let transaction = ensureTransaction(event);

  ownerSet.fund = useFund(event.address.toHex()).id;
  ownerSet.account = ensureAccount(Address.fromString(transaction.from), event).id;
  ownerSet.contract = ensureContract(event.address, 'VaultLib', event).id;
  ownerSet.timestamp = event.block.timestamp;
  ownerSet.transaction = transaction.id;

  if (event.params.prevOwner != zeroAddress) {
    ownerSet.prevOwner = ensureAccount(event.params.prevOwner, event).id;
  }
  ownerSet.nextOwner = ensureAccount(event.params.nextOwner, event).id;

  ownerSet.save();
}

export function handleTrackedAssetAdded(event: TrackedAssetAdded): void {
  let id = genericId(event);
  let fund = useFund(event.address.toHex());
  let asset = ensureAsset(event.params.asset);
  let trackedAssetAddition = new TrackedAssetAddedEvent(id);

  trackedAssetAddition.asset = asset.id;
  trackedAssetAddition.fund = fund.id;
  trackedAssetAddition.account = ensureAccount(Address.fromString(fund.manager), event).id;
  trackedAssetAddition.contract = useContract(event.address.toHex()).id;
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
  let trackedAssetRemoval = new TrackedAssetRemovedEvent(id);
  trackedAssetRemoval.asset = asset.id;
  trackedAssetRemoval.fund = fund.id;
  trackedAssetRemoval.timestamp = event.block.timestamp;
  trackedAssetRemoval.account = useAccount(fund.manager).id;
  trackedAssetRemoval.contract = useContract(event.address.toHex()).id;
  trackedAssetRemoval.transaction = ensureTransaction(event).id;
  trackedAssetRemoval.save();

  fund.trackedAssets = arrayDiff<string>(fund.trackedAssets, [asset.id]);
  fund.save();
}

export function handleVaultLibSet(event: VaultLibSet): void {
  let id = genericId(event);
  let vaultLibSet = new VaultLibSetEvent(id);
  vaultLibSet.fund = useFund(event.address.toHex()).id;
  vaultLibSet.account = ensureAccount(Address.fromString(ensureTransaction(event).from), event).id;
  vaultLibSet.contract = ensureContract(event.address, 'VaultLib', event).id;
  vaultLibSet.timestamp = event.block.timestamp;
  vaultLibSet.transaction = ensureTransaction(event).id;
  vaultLibSet.prevVaultLib = event.params.prevVaultLib.toHex();
  vaultLibSet.nextVaultLib = event.params.nextVaultLib.toHex();
  vaultLibSet.save();
}

/**
 * approvals will only be applicable if and when the transfer of fund shares is allowed
 * to implement the functions below:
 *  - uncomment the types in schema.graphql
 *  - run yarn codegen
 *  - import the ApprovalEvent and TransferEvent types from ../generated/schema.ts
 *  - import the Approval and Transfer types from ../generated/VaultLibContract.ts
 */

// export function handleApproval(event: Approval): void {
// let id = genericId(event);
// let approval = new ApprovalEvent(id);
// approval.fund = useFund(event.address.toHex()).id;
// approval.account = ensureAccount(Address.fromString(ensureTransaction(event).from)).id;
// approval.contract = ensureContract(event.address, 'VaultLib', event).id;
// approval.timestamp = event.block.timestamp;
// approval.transaction = ensureTransaction(event).id;
// approval.owner = ensureAccount(Address.fromString(ensureTransaction(event).from)).id;
// approval.spender = useAdapter(event.params.spender.toHex()).id
// approval.value = toBigDecimal(event.params.value);
// approval.save();
// }

export function handleTransfer(event: Transfer): void {
  let id = genericId(event);
  let transaction = ensureTransaction(event);

  let transfer = new TransferEvent(id);
  transfer.fund = useFund(event.address.toHex()).id;
  transfer.account = ensureAccount(Address.fromString(transaction.from), event).id;
  transfer.contract = useContract(event.address.toHex()).id;
  transfer.timestamp = event.block.timestamp;
  transfer.transaction = transaction.id;
  transfer.from = event.params.from.toHex();
  transfer.to = event.params.to.toHex();
  transfer.amount = toBigDecimal(event.params.value);
  transfer.save();
}
