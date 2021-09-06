import { arrayDiff, arrayUnique, toBigDecimal, uniqueEventId, ZERO_ADDRESS } from '@enzymefinance/subgraph-utils';
import { ensureAccount, ensureAssetManager, ensureDepositor, ensureOwner } from '../../entities/Account';
import { ensureDeposit, trackDepositBalance } from '../../entities/Deposit';
import { useNetwork } from '../../entities/Network';
import { trackVaultTotalSupply, useVault } from '../../entities/Vault';
import {
  ProtocolFeeBurned,
  ProtocolFeePaid,
  SharesTransferredInEvent,
  SharesTransferredOutEvent,
} from '../../generated/schema';
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
} from '../../generated/VaultLib4Contract';

export function handleTransfer(event: Transfer): void {
  let vault = useVault(event.address.toHex());
  trackVaultTotalSupply(vault);

  // only track deposit balance if not zero address
  if (event.params.from.notEqual(ZERO_ADDRESS)) {
    let fromInvestor = ensureDepositor(event.params.from, event);
    let fromInvestment = ensureDeposit(fromInvestor, vault, event);
    trackDepositBalance(vault, fromInvestment);
  }

  // only track deposit balance if not zero address
  if (event.params.to.notEqual(ZERO_ADDRESS)) {
    let toInvestor = ensureDepositor(event.params.to, event);
    let toInvestment = ensureDeposit(toInvestor, vault, event);
    trackDepositBalance(vault, toInvestment);
  }

  if (
    // do not track mint and burn events
    event.params.from.equals(ZERO_ADDRESS) ||
    event.params.to.equals(ZERO_ADDRESS) ||
    // do not track transfers to or from the vault proxy (these are fee shares actions)
    // TODO: what about protocol fee payments?
    event.params.from.equals(event.address) ||
    event.params.to.equals(event.address)
  ) {
    return;
  }

  let shares = toBigDecimal(event.params.value);

  let fromInvestor = ensureDepositor(event.params.from, event);
  let fromInvestment = ensureDeposit(fromInvestor, vault, event);

  let transferOut = new SharesTransferredOutEvent(uniqueEventId(event, 'SharesTransferredOut'));
  transferOut.vault = vault.id;
  transferOut.depositor = fromInvestor.id;
  transferOut.deposit = fromInvestment.id;
  transferOut.type = 'SharesTransferredOut';
  transferOut.shares = shares;
  transferOut.timestamp = event.block.timestamp.toI32();
  transferOut.save();

  let toInvestor = ensureDepositor(event.params.to, event);
  let toInvestment = ensureDeposit(toInvestor, vault, event);

  let transferIn = new SharesTransferredInEvent(uniqueEventId(event, 'SharesTransferredIn'));
  transferIn.vault = vault.id;
  transferIn.depositor = toInvestor.id;
  transferIn.deposit = toInvestment.id;
  transferIn.type = 'SharesTransferredIn';
  transferIn.shares = shares;
  transferIn.timestamp = event.block.timestamp.toI32();
  transferIn.save();
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
  let vault = useVault(event.address.toHex());
  vault.nominatedOwner = null;
  vault.save();
}

export function handleNominatedOwnerSet(event: NominatedOwnerSet): void {
  let nominatedOwner = ensureAccount(event.params.nominatedOwner, event);

  let vault = useVault(event.address.toHex());
  vault.nominatedOwner = nominatedOwner.id;
  vault.save();
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  let nextOwner = ensureOwner(event.params.nextOwner, event);

  let vault = useVault(event.address.toHex());
  vault.owner = nextOwner.id;
  vault.nominatedOwner = null;
  vault.save();
}

export function handleTrackedAssetAdded(event: TrackedAssetAdded): void {
  let trackedAsset = ensureAssetManager(event.params.asset, event);

  let vault = useVault(event.address.toHex());
  vault.trackedAssets = arrayUnique<string>(vault.trackedAssets.concat([trackedAsset.id]));
  vault.save();
}

export function handleTrackedAssetRemoved(event: TrackedAssetRemoved): void {
  let trackedAsset = ensureAssetManager(event.params.asset, event);

  let vault = useVault(event.address.toHex());
  vault.trackedAssets = arrayDiff<string>(vault.trackedAssets, [trackedAsset.id]);
  vault.save();
}

export function handleProtocolFeePaidInShares(event: ProtocolFeePaidInShares): void {
  let feePaid = new ProtocolFeePaid(uniqueEventId(event));
  feePaid.vault = event.address.toHex();
  feePaid.shares = toBigDecimal(event.params.sharesAmount);
  feePaid.save();
}
export function handleProtocolFeeSharesBoughtBack(event: ProtocolFeeSharesBoughtBack): void {
  let mlnBurned = toBigDecimal(event.params.mlnBurned);

  let feeBurned = new ProtocolFeeBurned(uniqueEventId(event));
  feeBurned.vault = event.address.toHex();
  feeBurned.sharesBoughtBack = toBigDecimal(event.params.sharesAmount);
  feeBurned.mlnBurned = mlnBurned;
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
