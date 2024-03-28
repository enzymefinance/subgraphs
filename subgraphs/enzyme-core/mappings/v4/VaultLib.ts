import { arrayDiff, arrayUnique, toBigDecimal, uniqueEventId, ZERO_ADDRESS } from '@enzymefinance/subgraph-utils';
import { useAaveDebtPosition } from '../../entities/AaveDebtPosition';
import { ensureAccount, ensureAssetManager, ensureDepositor, ensureOwner } from '../../entities/Account';
import { useArbitraryLoanPosition } from '../../entities/ArbitraryLoanPosition';
import { ensureAsset } from '../../entities/Asset';
import { useCompoundDebtPosition } from '../../entities/CompoundDebtPosition';
import { useConvexVotingPosition } from '../../entities/ConvexVotingPosition';
import { getActivityCounter } from '../../entities/Counter';
import { ensureDeposit, trackDeposit } from '../../entities/Deposit';
import { useExternalPositionType } from '../../entities/ExternalPositionType';
import { useMapleLiquidityPosition } from '../../entities/MapleLiquidityPosition';
import { useNetwork } from '../../entities/Network';
import { useUniswapV3LiquidityPosition } from '../../entities/UniswapV3LiquidityPosition';
import { useVault } from '../../entities/Vault';
import { release4Addresses } from '../../generated/addresses';
import { ProtocolSdk } from '../../generated/contracts/ProtocolSdk';
import { useLiquityDebtPosition } from '../../entities/LiquityDebtPosition';
import {
  AccessorSet,
  Approval,
  AssetManagerAdded,
  AssetManagerRemoved,
  AssetWithdrawn,
  EthReceived,
  ExternalPositionAdded,
  ExternalPositionRemoved,
  FreelyTransferableSharesSet,
  MigratorSet,
  NameSet,
  NominatedOwnerRemoved,
  NominatedOwnerSet,
  OwnerSet,
  OwnershipTransferred,
  ProtocolFeePaidInShares,
  ProtocolFeeSharesBoughtBack,
  SymbolSet,
  TrackedAssetAdded,
  TrackedAssetRemoved,
  Transfer,
  VaultLibSet,
} from '../../generated/contracts/VaultLib4Events';
import {
  ExternalPositionAddedEvent,
  ExternalPositionRemovedEvent,
  FreelyTransferableSharesSetEvent,
  ProtocolFeeBurned,
  ProtocolFeePaid,
  SharesTransferEvent,
  SharesTransferredInEvent,
  SharesTransferredOutEvent,
  VaultNominatedOwnerRemoved,
  VaultNominatedOwnerSet,
  VaultOwnershipTransferred,
} from '../../generated/schema';
import { useKilnStakingPosition } from '../../entities/KilnStakingPosition';
import { useLidoWithdrawalsPosition } from '../../entities/LidoWithdrawalsPosition';
import { useAaveV3DebtPosition } from '../../entities/AaveV3DebtPosition';
import { useStakeWiseStakingPosition } from '../../entities/StakeWiseStakingPosition';
import { usePendleV2Position } from '../../entities/PendleV2Position';

export function handleTransfer(event: Transfer): void {
  // only track deposit balance if not zero address
  if (event.params.from.notEqual(ZERO_ADDRESS)) {
    trackDeposit(event.address, event.params.from, event);
  }

  // only track deposit balance if not zero address
  if (event.params.to.notEqual(ZERO_ADDRESS)) {
    trackDeposit(event.address, event.params.to, event);
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

  // do not track transfers to self (which can occur with entrance/exit direct fees,
  // if the depositor is also the fee recipient)
  if (event.params.from.equals(event.params.to)) {
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

export function handleAccessorSet(event: AccessorSet): void { }

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

  let freelyTransferable = new FreelyTransferableSharesSetEvent(uniqueEventId(event));
  freelyTransferable.vault = vault.id;
  freelyTransferable.timestamp = event.block.timestamp.toI32();
  freelyTransferable.activityCounter = getActivityCounter();
  freelyTransferable.activityCategories = ['Vault'];
  freelyTransferable.activityType = 'VaultSettings';
  freelyTransferable.save();
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
  let trackedAsset = ensureAsset(event.params.asset);

  let vault = useVault(event.address.toHex());
  vault.trackedAssets = arrayUnique<string>(vault.trackedAssets.concat([trackedAsset.id]));
  vault.save();
}

export function handleTrackedAssetRemoved(event: TrackedAssetRemoved): void {
  let trackedAsset = ensureAsset(event.params.asset);

  let vault = useVault(event.address.toHex());
  vault.trackedAssets = arrayDiff<string>(vault.trackedAssets, [trackedAsset.id]);
  vault.save();
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

export function handleNameSet(event: NameSet): void {
  let vault = useVault(event.address.toHex());
  vault.name = event.params.name;
  vault.save();
}

export function handleSymbolSet(event: SymbolSet): void {
  let vault = useVault(event.address.toHex());
  vault.symbol = event.params.symbol;
  vault.save();
}

export function handleExternalPositionAdded(event: ExternalPositionAdded): void {
  let iExternalPositionProxy = ProtocolSdk.bind(event.params.externalPosition);
  let typeId = iExternalPositionProxy.getExternalPositionType();

  let type = useExternalPositionType(typeId);

  if (type.label == 'COMPOUND_DEBT') {
    let cdp = useCompoundDebtPosition(event.params.externalPosition.toHex());
    cdp.active = true;
    cdp.save();
  }

  if (type.label == 'AAVE_DEBT') {
    let adp = useAaveDebtPosition(event.params.externalPosition.toHex());
    adp.active = true;
    adp.save();
  }

  if (type.label == 'AAVE_V3_DEBT') {
    let adp = useAaveV3DebtPosition(event.params.externalPosition.toHex());
    adp.active = true;
    adp.save();
  }

  if (type.label == 'UNISWAP_V3_LIQUIDITY') {
    let uv3lp = useUniswapV3LiquidityPosition(event.params.externalPosition.toHex());
    uv3lp.active = true;
    uv3lp.save();
  }

  if (type.label == 'CONVEX_VOTING') {
    let cvx = useConvexVotingPosition(event.params.externalPosition.toHex());
    cvx.active = true;
    cvx.save();
  }

  if (type.label == 'ARBITRARY_LOAN') {
    let arb = useArbitraryLoanPosition(event.params.externalPosition.toHex());
    arb.active = true;
    arb.save();
  }

  if (type.label == 'MAPLE_LIQUIDITY') {
    let mpl = useMapleLiquidityPosition(event.params.externalPosition.toHex());
    mpl.active = true;
    mpl.save();
  }

  if (type.label == 'LIQUITY_DEBT') {
    let ldp = useLiquityDebtPosition(event.params.externalPosition.toHex());
    ldp.active = true;
    ldp.save();
  }

  if (type.label == 'KILN_STAKING') {
    let ksp = useKilnStakingPosition(event.params.externalPosition.toHex());
    ksp.active = true;
    ksp.save();
  }

  if (type.label == 'LIDO_WITHDRAWALS') {
    let lwp = useLidoWithdrawalsPosition(event.params.externalPosition.toHex());
    lwp.active = true;
    lwp.save();
  }

  if (type.label == 'PENDLE_V2') {
    let pp = usePendleV2Position(event.params.externalPosition.toHex());
    pp.active = true;
    pp.save();
  }

  if (type.label == 'STAKEWISE_V3') {
    let ssp = useStakeWiseStakingPosition(event.params.externalPosition.toHex());
    ssp.active = true;
    ssp.save();
  }

  let activity = new ExternalPositionAddedEvent(uniqueEventId(event));
  activity.timestamp = event.block.timestamp.toI32();
  activity.vault = event.address.toHex();
  activity.externalPosition = event.params.externalPosition.toHex();
  activity.activityCounter = getActivityCounter();
  activity.activityCategories = ['Vault'];
  activity.activityType = 'VaultSettings';
  activity.save();
}

export function handleExternalPositionRemoved(event: ExternalPositionRemoved): void {
  let iExternalPositionProxy = ProtocolSdk.bind(event.params.externalPosition);
  let typeId = iExternalPositionProxy.getExternalPositionType();

  let type = useExternalPositionType(typeId);

  if (type.label == 'COMPOUND_DEBT') {
    let cdp = useCompoundDebtPosition(event.params.externalPosition.toHex());
    cdp.active = false;
    cdp.save();
  }

  if (type.label == 'AAVE_DEBT') {
    let adp = useAaveDebtPosition(event.params.externalPosition.toHex());
    adp.active = false;
    adp.save();
  }

  if (type.label == 'AAVE_V3_DEBT') {
    let adp = useAaveV3DebtPosition(event.params.externalPosition.toHex());
    adp.active = false;
    adp.save();
  }

  if (type.label == 'UNISWAP_V3_LIQUIDITY') {
    let uv3lp = useUniswapV3LiquidityPosition(event.params.externalPosition.toHex());
    uv3lp.active = false;
    uv3lp.save();
  }

  if (type.label == 'CONVEX_VOTING') {
    let cvx = useConvexVotingPosition(event.params.externalPosition.toHex());
    cvx.active = false;
    cvx.save();
  }

  if (type.label == 'ARBITRARY_LOAN') {
    let arb = useArbitraryLoanPosition(event.params.externalPosition.toHex());
    arb.active = false;
    arb.save();
  }

  if (type.label == 'MAPLE_LIQUIDITY') {
    let mpl = useMapleLiquidityPosition(event.params.externalPosition.toHex());
    mpl.active = false;
    mpl.save();
  }

  if (type.label == 'LIQUITY_DEBT') {
    let ldp = useLiquityDebtPosition(event.params.externalPosition.toHex());
    ldp.active = false;
    ldp.save();
  }

  if (type.label == 'KILN_STAKING') {
    let ksp = useKilnStakingPosition(event.params.externalPosition.toHex());
    ksp.active = false;
    ksp.save();
  }

  if (type.label == 'LIDO_WITHDRAWALS') {
    let lwp = useLidoWithdrawalsPosition(event.params.externalPosition.toHex());
    lwp.active = false;
    lwp.save();
  }

  if (type.label == 'PENDLE_V2') {
    let pp = usePendleV2Position(event.params.externalPosition.toHex());
    pp.active = false;
    pp.save();
  }

  if (type.label == 'STAKEWISE_V3') {
    let ssp = useStakeWiseStakingPosition(event.params.externalPosition.toHex());
    ssp.active = false;
    ssp.save();
  }

  let activity = new ExternalPositionRemovedEvent(uniqueEventId(event));
  activity.timestamp = event.block.timestamp.toI32();
  activity.vault = event.address.toHex();
  activity.externalPosition = event.params.externalPosition.toHex();
  activity.activityCounter = getActivityCounter();
  activity.activityCategories = ['Vault'];
  activity.activityType = 'VaultSettings';
  activity.save();
}

export function handleEthReceived(event: EthReceived): void {
  let vault = useVault(event.address.toHex());
  vault.lastAssetUpdate = event.block.timestamp.toI32();
  vault.save();
}

export function handleApproval(event: Approval): void { }
export function handleAssetWithdrawn(event: AssetWithdrawn): void { }
export function handleVaultLibSet(event: VaultLibSet): void { }
