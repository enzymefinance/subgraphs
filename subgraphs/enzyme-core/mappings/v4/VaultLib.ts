import { arrayDiff, arrayUnique, toBigDecimal, uniqueEventId, ZERO_ADDRESS } from '@enzymefinance/subgraph-utils';
import { ensureAccount, ensureAssetManager, ensureDepositor, ensureOwner } from '../../entities/Account';
import { getActivityCounter } from '../../entities/Counter';
import { ensureDeposit } from '../../entities/Deposit';
import { trackDepositMetric } from '../../entities/DepositMetric';
import { useNetwork } from '../../entities/Network';
import { useVault } from '../../entities/Vault';
import { trackVaultMetric } from '../../entities/VaultMetric';
import { release4Addresses } from '../../generated/addresses';
import {
  AccessorSet,
  Approval,
  AssetManagerAdded,
  AssetManagerRemoved,
  AssetWithdrawn,
  ExternalPositionAdded,
  ExternalPositionRemoved,
  FreelyTransferableSharesSet,
  MigratorSet,
  NominatedOwnerRemoved,
  NominatedOwnerSet,
  OwnerSet,
  OwnershipTransferred,
  ProtocolFeePaidInShares,
  ProtocolFeeSharesBoughtBack,
  TrackedAssetAdded,
  TrackedAssetRemoved,
  Transfer,
  VaultLibSet,
} from '../../generated/contracts/VaultLib4Events';
import {
  ProtocolFeeBurned,
  ProtocolFeePaid,
  SharesTransferEvent,
  SharesTransferredInEvent,
  SharesTransferredOutEvent,
  VaultNominatedOwnerRemoved,
  VaultNominatedOwnerSet,
  VaultOwnershipTransferred,
} from '../../generated/schema';

export function handleTransfer(event: Transfer): void {
  trackVaultMetric(event.address, event);

  // only track deposit balance if not zero address
  if (event.params.from.notEqual(ZERO_ADDRESS)) {
    trackDepositMetric(event.address, event.params.from, event);
  }

  // only track deposit balance if not zero address
  if (event.params.to.notEqual(ZERO_ADDRESS)) {
    trackDepositMetric(event.address, event.params.to, event);
  }

  if (
    // do not track mint and burn events
    event.params.from.equals(ZERO_ADDRESS) ||
    event.params.to.equals(ZERO_ADDRESS) ||
    // do not track transfers to or from the vault proxy (these are fee shares actions)
    event.params.from.equals(event.address) ||
    event.params.to.equals(event.address)
    // TODO: what about protocol fee payments?
  ) {
    return;
  }

  let vault = useVault(event.address.toHex());
  let shares = toBigDecimal(event.params.value);

  let fromInvestor = ensureDepositor(event.params.from, event);
  let fromInvestment = ensureDeposit(fromInvestor, vault, event);

  let transferOut = new SharesTransferredOutEvent(uniqueEventId(event, 'SharesTransferredOut'));
  transferOut.vault = vault.id;
  transferOut.depositor = fromInvestor.id;
  transferOut.deposit = fromInvestment.id;
  transferOut.sharesChangeType = 'SharesTransferredOut';
  transferOut.shares = shares;
  transferOut.timestamp = event.block.timestamp.toI32();
  transferOut.activityCounter = getActivityCounter();
  transferOut.activityCategories = ['Depositor'];
  transferOut.activityType = 'DepositorShares';
  transferOut.save();

  let toInvestor = ensureDepositor(event.params.to, event);
  let toInvestment = ensureDeposit(toInvestor, vault, event);

  let transferIn = new SharesTransferredInEvent(uniqueEventId(event, 'SharesTransferredIn'));
  transferIn.vault = vault.id;
  transferIn.depositor = toInvestor.id;
  transferIn.deposit = toInvestment.id;
  transferIn.sharesChangeType = 'SharesTransferredIn';
  transferIn.shares = shares;
  transferIn.timestamp = event.block.timestamp.toI32();
  transferIn.activityCounter = getActivityCounter();
  transferIn.activityCategories = ['Depositor'];
  transferIn.activityType = 'DepositorShares';
  transferIn.save();

  let transfer = new SharesTransferEvent(uniqueEventId(event, 'SharesTransfer'));
  transfer.vault = vault.id;
  transfer.from = fromInvestor.id;
  transfer.to = toInvestor.id;
  transfer.shares = shares;
  transfer.timestamp = event.block.timestamp.toI32();
  transfer.activityCounter = getActivityCounter();
  transfer.activityCategories = ['Vault'];
  transfer.activityType = 'DepositorShares';
  transfer.save();
}

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

export function handleAccessorSet(event: AccessorSet): void {
  let vault = useVault(event.address.toHex());
  vault.comptroller = event.params.nextAccessor.toHex();
  vault.save();
}

export function handleAssetManagerAdded(event: AssetManagerAdded): void {
  let assetManager = ensureAssetManager(event.params.manager, event);

  let vault = useVault(event.address.toHex());
  vault.assetManagers = arrayUnique<string>(vault.assetManagers.concat([assetManager.id]));
  vault.save();
}

export function handleAssetManagerRemoved(event: AssetManagerRemoved): void {
  let assetManager = ensureAssetManager(event.params.manager, event);

  let vault = useVault(event.address.toHex());
  vault.assetManagers = arrayDiff<string>(vault.assetManagers, [assetManager.id]);
  vault.save();
}

export function handleFreelyTransferableSharesSet(event: FreelyTransferableSharesSet): void {
  let vault = useVault(event.address.toHex());
  vault.freelyTransferableShares = true;
  vault.save();
}

export function handleNominatedOwnerRemoved(event: NominatedOwnerRemoved): void {
  let nominatedOwner = ensureAccount(event.params.nominatedOwner, event);

  let vault = useVault(event.address.toHex());
  vault.nominatedOwner = null;
  vault.save();

  let activity = new VaultNominatedOwnerRemoved(uniqueEventId(event));
  activity.vault = vault.id;
  activity.nominatedOwner = nominatedOwner.id;
  activity.timestamp = event.block.timestamp.toI32();
  activity.activityCounter = getActivityCounter();
  activity.activityCategories = ['Vault'];
  activity.activityType = 'VaultSettings';
  activity.save();
}

export function handleNominatedOwnerSet(event: NominatedOwnerSet): void {
  let nominatedOwner = ensureAccount(event.params.nominatedOwner, event);

  let vault = useVault(event.address.toHex());
  vault.nominatedOwner = nominatedOwner.id;
  vault.save();

  let activity = new VaultNominatedOwnerSet(uniqueEventId(event));
  activity.vault = vault.id;
  activity.nominatedOwner = nominatedOwner.id;
  activity.timestamp = event.block.timestamp.toI32();
  activity.activityCounter = getActivityCounter();
  activity.activityCategories = ['Vault'];
  activity.activityType = 'VaultSettings';
  activity.save();
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  let prevOwner = ensureOwner(event.params.prevOwner, event);
  let nextOwner = ensureOwner(event.params.nextOwner, event);

  let vault = useVault(event.address.toHex());
  vault.owner = nextOwner.id;
  vault.nominatedOwner = null;
  vault.save();

  let activity = new VaultOwnershipTransferred(uniqueEventId(event));
  activity.vault = vault.id;
  activity.prevOwner = prevOwner.id;
  activity.nextOwner = nextOwner.id;
  activity.timestamp = event.block.timestamp.toI32();
  activity.activityCounter = getActivityCounter();
  activity.activityCategories = ['Vault'];
  activity.activityType = 'VaultSettings';
  activity.save();
}

export function handleTrackedAssetAdded(event: TrackedAssetAdded): void {
  let trackedAsset = ensureAssetManager(event.params.asset, event);

  let vault = useVault(event.address.toHex());
  vault.trackedAssets = arrayUnique<string>(vault.trackedAssets.concat([trackedAsset.id]));
  vault.save();

  trackVaultMetric(event.address, event);
}

export function handleTrackedAssetRemoved(event: TrackedAssetRemoved): void {
  let trackedAsset = ensureAssetManager(event.params.asset, event);

  let vault = useVault(event.address.toHex());
  vault.trackedAssets = arrayDiff<string>(vault.trackedAssets, [trackedAsset.id]);
  vault.save();

  trackVaultMetric(event.address, event);
}

export function handleProtocolFeePaidInShares(event: ProtocolFeePaidInShares): void {
  let vault = useVault(event.address.toHex());

  let depositor = ensureDepositor(release4Addresses.protocolFeeTrackerAddress, event);
  let deposit = ensureDeposit(depositor, vault, event);

  let feePaid = new ProtocolFeePaid(uniqueEventId(event));
  feePaid.timestamp = event.block.timestamp.toI32();
  feePaid.vault = vault.id;
  feePaid.shares = toBigDecimal(event.params.sharesAmount);
  feePaid.sharesChangeType = 'ProtocolFeePaid';
  feePaid.depositor = depositor.id;
  feePaid.deposit = deposit.id;
  feePaid.activityCounter = getActivityCounter();
  feePaid.activityCategories = ['Vault'];
  feePaid.activityType = 'ProtocolFee';
  feePaid.save();
}
export function handleProtocolFeeSharesBoughtBack(event: ProtocolFeeSharesBoughtBack): void {
  let mlnBurned = toBigDecimal(event.params.mlnBurned);

  let vault = useVault(event.address.toHex());

  let depositor = ensureDepositor(release4Addresses.protocolFeeTrackerAddress, event);
  let deposit = ensureDeposit(depositor, vault, event);

  let feeBurned = new ProtocolFeeBurned(uniqueEventId(event));
  feeBurned.timestamp = event.block.timestamp.toI32();
  feeBurned.vault = event.address.toHex();
  feeBurned.shares = toBigDecimal(event.params.sharesAmount);
  feeBurned.sharesChangeType = 'ProtocolFeePaid';
  feeBurned.depositor = depositor.id;
  feeBurned.deposit = deposit.id;
  feeBurned.mlnBurned = mlnBurned;
  feeBurned.activityCounter = getActivityCounter();
  feeBurned.activityCategories = ['Vault'];
  feeBurned.activityType = 'ProtocolFee';
  feeBurned.save();

  let network = useNetwork();
  network.mlnBurned = network.mlnBurned.plus(mlnBurned);
  network.save();
}

export function handleApproval(event: Approval): void {}
export function handleAssetWithdrawn(event: AssetWithdrawn): void {}
export function handleExternalPositionAdded(event: ExternalPositionAdded): void {}
export function handleExternalPositionRemoved(event: ExternalPositionRemoved): void {}
export function handleVaultLibSet(event: VaultLibSet): void {}