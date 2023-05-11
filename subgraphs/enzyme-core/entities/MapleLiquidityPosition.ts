import { logCritical, toBigDecimal, uniqueEventId } from '@enzymefinance/subgraph-utils';
import { Address, ethereum, BigInt } from '@graphprotocol/graph-ts';
import {
  MapleLiquidityPosition,
  MapleLiquidityPositionChange,
  Vault,
  AssetAmount,
  ExternalPositionType,
  Asset,
  MapleLiquidityPoolV1,
  MapleLiquidityPoolV2,
} from '../generated/schema';
import { getActivityCounter } from './Counter';
import { useVault } from './Vault';
import { ensureAsset } from './Asset';
import { createAssetAmount } from './AssetAmount';
import { ExternalSdk } from '../generated/contracts/ExternalSdk';

export function useMapleLiquidityPosition(id: string): MapleLiquidityPosition {
  let mapleLiquidityPosition = MapleLiquidityPosition.load(id);
  if (mapleLiquidityPosition == null) {
    logCritical('Failed to load MapleLiquidityPosition {}.', [id]);
  }

  return mapleLiquidityPosition as MapleLiquidityPosition;
}

export function createMapleLiquidityPosition(
  externalPositionAddress: Address,
  vaultAddress: Address,
  type: ExternalPositionType,
): MapleLiquidityPosition {
  let mapleLiquidityPosition = new MapleLiquidityPosition(externalPositionAddress.toHex());
  mapleLiquidityPosition.vault = useVault(vaultAddress.toHex()).id;
  mapleLiquidityPosition.active = true;
  mapleLiquidityPosition.type = type.id;
  mapleLiquidityPosition.pools = new Array<string>();
  mapleLiquidityPosition.save();

  return mapleLiquidityPosition;
}

export function createMapleLiquidityPositionChange(
  mapleLiquidityPositionAddress: Address,
  poolV1: MapleLiquidityPoolV1 | null,
  poolV2: MapleLiquidityPoolV2 | null,
  assetAmount: AssetAmount | null,
  asset: Asset | null,
  changeType: string,
  vault: Vault,
  event: ethereum.Event,
): MapleLiquidityPositionChange {
  let change = new MapleLiquidityPositionChange(uniqueEventId(event));
  change.mapleLiquidityPositionChangeType = changeType;
  change.externalPosition = mapleLiquidityPositionAddress.toHex();
  change.poolV1 = poolV1 != null ? poolV1.id : null;
  change.poolV2 = poolV2 != null ? poolV2.id : null;
  change.assetAmount = assetAmount != null ? assetAmount.id : null;
  change.asset = asset != null ? asset.id : null;
  change.vault = vault.id;
  change.timestamp = event.block.timestamp.toI32();
  change.activityCounter = getActivityCounter();
  change.activityCategories = ['Vault'];
  change.activityType = 'Trade';
  change.save();

  vault.lastAssetUpdate = event.block.timestamp.toI32();
  vault.save();

  return change;
}

export function createMapleLiquidityAssetAmountV1(
  mapleLiquidityPool: MapleLiquidityPoolV1,
  amount: BigInt,
  denominationAsset: Asset,
  event: ethereum.Event,
): AssetAmount {
  let liquidityAsset = ensureAsset(Address.fromString(mapleLiquidityPool.liquidityAsset));
  let liquidityAmount = toBigDecimal(amount, liquidityAsset.decimals);

  return createAssetAmount(liquidityAsset, liquidityAmount, denominationAsset, 'mlp', event);
}

export function createMapleLiquidityAssetAmountV2(
  mapleLiquidityPool: MapleLiquidityPoolV2,
  amount: BigInt,
  denominationAsset: Asset,
  event: ethereum.Event,
): AssetAmount {
  let liquidityAsset = ensureAsset(Address.fromString(mapleLiquidityPool.liquidityAsset));
  let liquidityAmount = toBigDecimal(amount, liquidityAsset.decimals);

  return createAssetAmount(liquidityAsset, liquidityAmount, denominationAsset, 'mlp', event);
}

export function createMapleLiquidityAssetAmountByPoolTokenAmountV1(
  mapleLiquidityPool: MapleLiquidityPoolV1,
  poolTokenAmount: BigInt,
  denominationAsset: Asset,
  event: ethereum.Event,
): AssetAmount {
  let liquidityAsset = ensureAsset(Address.fromString(mapleLiquidityPool.liquidityAsset));

  let poolAsset = ensureAsset(Address.fromString(mapleLiquidityPool.id));

  let liquidityAssetAmount = toBigDecimal(poolTokenAmount, poolAsset.decimals);

  return createAssetAmount(liquidityAsset, liquidityAssetAmount, denominationAsset, 'mlp', event);
}

export function createMapleLiquidityAssetAmountByPoolTokenAmountV2(
  mapleLiquidityPool: MapleLiquidityPoolV2,
  poolTokenAmount: BigInt,
  denominationAsset: Asset,
  event: ethereum.Event,
): AssetAmount {
  let poolContract = ExternalSdk.bind(Address.fromString(mapleLiquidityPool.id));

  let liquidityAsset = ensureAsset(Address.fromString(mapleLiquidityPool.liquidityAsset));

  let liquidityAssetAmount = toBigDecimal(poolContract.convertToExitAssets(poolTokenAmount), liquidityAsset.decimals);

  return createAssetAmount(liquidityAsset, liquidityAssetAmount, denominationAsset, 'mlp', event);
}

export function createMapleLiquidityAssetAmountByRedeemedPoolTokenAmountV2(
  sharesOwner: Address,
  mapleLiquidityPool: MapleLiquidityPoolV2,
  requestedToReedemShares: BigInt,
  denominationAsset: Asset,
  event: ethereum.Event,
): AssetAmount {
  let poolContract = ExternalSdk.bind(Address.fromString(mapleLiquidityPool.id));

  let liquidityAsset = ensureAsset(Address.fromString(mapleLiquidityPool.liquidityAsset));

  let totalShares = poolContract.totalSupply();

  let unrealizedLosses = poolContract.unrealizedLosses();

  let totalAssets = poolContract.totalAssets();

  let poolManagerContract = ExternalSdk.bind(Address.fromBytes(mapleLiquidityPool.manager));

  let withdrawalManager = poolManagerContract.withdrawalManager();

  let withdrawalManagerContract = ExternalSdk.bind(withdrawalManager);

  let currentLockedShares = withdrawalManagerContract.lockedShares(sharesOwner);

  let redeemedShares = requestedToReedemShares.minus(currentLockedShares);

  let redeemedLiquidityAmount = redeemedShares.times(totalAssets.minus(unrealizedLosses)).div(totalShares);

  let liquidityAssetAmount = toBigDecimal(redeemedLiquidityAmount, liquidityAsset.decimals);

  return createAssetAmount(liquidityAsset, liquidityAssetAmount, denominationAsset, 'mlp', event);
}
