import {
  AccessorSet,
  AssetWithdrawn,
  MigratorSet,
  OwnerSet,
  TrackedAssetAdded,
  TrackedAssetRemoved,
  VaultLibSet,
} from '../generated/VaultLibContract';

import { useFund } from '../entities/Fund';
import { ensureAsset } from '../entities/Asset';
import {
  TrackedAssetAddition,
  TrackedAssetRemoval,
  AssetWithdrawal,
  AccessorSetEvent,
   OwnerSetEvent, MigratorSetEvent, VaultLibSetEvent, 
} from '../generated/schema';
import { arrayUnique } from '../utils/arrayUnique';
import { arrayDiff } from '../utils/arrayDiff';
import { genericId } from '../utils/genericId';
import { ensureTransaction } from '../entities/Transaction';
import { ensureAccount, ensureManager } from '../entities/Account';
import { Address } from '@graphprotocol/graph-ts';
import { ensureContract } from '../entities/Contract';
import { ensureComptroller } from '../entities/Comptroller';
import { useAdapter } from '../entities/IntegrationAdapter';
import { toBigDecimal } from '../utils/tokenValue';

export function handleAccessorSet(event: AccessorSet): void {
  let id = genericId(event);
  let accessorSet = new AccessorSetEvent(id);
 
  accessorSet.contract = ensureContract(event.address, 'VaultLib', event.block.timestamp).id;
  accessorSet.fund = useFund(event.address.toHex()).id;
  accessorSet.account = ensureManager(Address.fromString(ensureTransaction(event).from)).id;
  accessorSet.prevAccessor = ensureComptroller(event.params.prevAccessor).id;
  accessorSet.nextAccessor = ensureComptroller(event.params.nextAccessor).id;
  accessorSet.transaction = ensureTransaction(event).id;
 
  accessorSet.save();
}

export function handleAssetWithdrawn(event: AssetWithdrawn): void {
  let id = genericId(event);
  let withdrawal = new AssetWithdrawal(id);
  let address = Address.fromString(ensureTransaction(event).from);
  
  withdrawal.asset = ensureAsset(event.params.asset).id;
  withdrawal.fund = useFund(event.address.toHex()).id;
  withdrawal.account = ensureManager(address).id;
  withdrawal.timestamp = event.block.timestamp;
  withdrawal.transaction = ensureTransaction(event).id;
  withdrawal.target = event.params.target.toHex();
  withdrawal.amount = toBigDecimal(event.params.amount);
  
  withdrawal.save();
}

export function handleMigratorSet(event: MigratorSet): void {
  let id = genericId(event);
  let migratorSet = new MigratorSetEvent(id);
  
  migratorSet.fund = useFund(event.address.toHex()).id;
  migratorSet.account = ensureManager(Address.fromString(ensureTransaction(event).from)).id
  migratorSet.contract = ensureContract(event.address, 'VaultLib', event.block.timestamp).id
  migratorSet.timestamp = event.block.timestamp
  migratorSet.transaction = ensureTransaction(event).id
  migratorSet.prevMigrator = ensureAccount(event.params.prevMigrator).id
  migratorSet.nextMigrator = ensureAccount(event.params.nextMigrator).id
  
  migratorSet.save()
}

export function handleOwnerSet(event: OwnerSet): void {
  let id = genericId(event);
  let ownerSet = new OwnerSetEvent(id);
  
  ownerSet.fund = useFund(event.address.toHex()).id;
  ownerSet.account = ensureAccount(Address.fromString(ensureTransaction(event).from)).id
  ownerSet.contract = ensureContract(event.address, 'VaultLib', event.block.timestamp).id
  ownerSet.timestamp = event.block.timestamp
  ownerSet.transaction = ensureTransaction(event).id
  ownerSet.prevOwner = ensureAccount(event.params.prevOwner).id
  ownerSet.nextOwner = ensureAccount(event.params.nextOwner).id
  
  ownerSet.save()
}

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

export function handleVaultLibSet(event: VaultLibSet): void {
  let id = genericId(event);
  let vaultLibSet = new VaultLibSetEvent(id);
  vaultLibSet.fund = useFund(event.address.toHex()).id;
  vaultLibSet.account = ensureAccount(Address.fromString(ensureTransaction(event).from)).id
  vaultLibSet.contract = ensureContract(event.address, 'VaultLib', event.block.timestamp).id
  vaultLibSet.timestamp = event.block.timestamp
  vaultLibSet.transaction = ensureTransaction(event).id
  vaultLibSet.prevVaultLib = ensureAccount(event.params.prevVaultLib).id
  vaultLibSet.nextVaultLib = ensureAccount(event.params.nextVaultLib).id
  vaultLibSet.save()
}


/**
 * approvals and transfers will only be applicable if and when the transfer of fund shares is allowed
 * to implement the functions below: 
 *  - uncomment the types in schema.graphql
 *  - run yarn codegen
 *  - import the ApprovalGranted and TransferEvent types from ../generated/schema.ts
 *  - import the Approval and Transfer types from ../generated/VaultLibContract.ts
 */


 // export function handleApproval(event: Approval): void {
  // let id = genericId(event);
  // let approval = new ApprovalGranted(id);
  // approval.fund = useFund(event.address.toHex()).id;
  // approval.account = ensureAccount(Address.fromString(ensureTransaction(event).from)).id;
  // approval.contract = ensureContract(event.address, 'VaultLib', event.block.timestamp).id;
  // approval.timestamp = event.block.timestamp;
  // approval.transaction = ensureTransaction(event).id;
  // approval.owner = ensureAccount(Address.fromString(ensureTransaction(event).from)).id;
  // approval.spender = useAdapter(event.params.spender.toHex()).id
  // approval.value = event.params.value
// }

// export function handleTransfer(event: Transfer): void {
//   let id = genericId(event);
//   let transfer = new TransferEvent(id);
//   transfer.fund = useFund(event.address.toHex()).id;
//   transfer.account = ensureManager(Address.fromString(ensureTransaction(event).from)).id;
//   transfer.contract = ensureContract(event.address, 'VaultLib', event.block.timestamp).id;
//   transfer.timestamp = event.block.timestamp;
//   transfer.transaction = ensureTransaction(event).id;
//   transfer.from = ensureComptroller(Address.fromString(ensureTransaction(event).from)).id;
//   transfer.to = ensureAccount(event.params.to).id
//   transfer.amount = toBigDecimal(event.params.value)
// }
