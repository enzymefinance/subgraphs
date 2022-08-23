import { logCritical, toBigDecimal, uniqueEventId } from '@enzymefinance/subgraph-utils';
import { Address, ethereum, BigInt } from '@graphprotocol/graph-ts';
import {
  MapleLiquidityPosition,
  MapleLiquidityPositionChange,
  Vault,
  AssetAmount,
  ExternalPositionType,
  Asset,
  MapleLiquidityPool,
} from '../generated/schema';
import { getActivityCounter } from './Counter';
import { useVault } from './Vault';
import { ensureAsset } from './Asset';
import { createAssetAmount } from './AssetAmount';

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
  pool: MapleLiquidityPool,
  assetAmount: AssetAmount | null,
  changeType: string,
  vault: Vault,
  event: ethereum.Event,
): MapleLiquidityPositionChange {
  let change = new MapleLiquidityPositionChange(uniqueEventId(event));
  change.mapleLiquidityPositionChangeType = changeType;
  change.externalPosition = mapleLiquidityPositionAddress.toHex();
  change.pool = pool.id;
  change.assetAmount = assetAmount != null ? assetAmount.id : null;
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

export function createMapleLiquidityAssetAmount(
  mapleLiquidityPool: MapleLiquidityPool,
  amount: BigInt,
  denominationAsset: Asset,
  event: ethereum.Event,
): AssetAmount {
  let liquidityAsset = ensureAsset(Address.fromString(mapleLiquidityPool.liquidityAsset));
  let liquidityAmount = toBigDecimal(amount, liquidityAsset.decimals);

  return createAssetAmount(liquidityAsset, liquidityAmount, denominationAsset, 'mlp', event);
}

export function createMapleLiquidityAssetAmountByPoolTokenAmount(
  mapleLiquidityPool: MapleLiquidityPool,
  poolTokenAmount: BigInt,
  denominationAsset: Asset,
  event: ethereum.Event,
): AssetAmount {
  let liquidityAsset = ensureAsset(Address.fromString(mapleLiquidityPool.liquidityAsset));

  let poolAsset = ensureAsset(Address.fromString(mapleLiquidityPool.id));

  let liquidityAssetAmount = toBigDecimal(poolTokenAmount, poolAsset.decimals);

  return createAssetAmount(liquidityAsset, liquidityAssetAmount, denominationAsset, 'mlp', event);
}
