import { Address } from '@graphprotocol/graph-ts';
import { ExternalSdk } from '../generated/contracts/ExternalSdk';
import { MapleLiquidityPoolV1, MapleLiquidityPoolV2 } from '../generated/schema';
import { ensureAsset } from './Asset';

export function createMapleLiquidityPoolV1(pool: Address, rewardsContract: Address | null): MapleLiquidityPoolV1 {
  let mapleLiquidityPool = new MapleLiquidityPoolV1(pool.toHex());

  let poolContract = ExternalSdk.bind(pool);
  let liquidityAsset = ensureAsset(poolContract.liquidityAsset());

  mapleLiquidityPool.liquidityAsset = liquidityAsset.id;
  mapleLiquidityPool.rewardsContract = rewardsContract ? rewardsContract : null;
  mapleLiquidityPool.save();

  return mapleLiquidityPool;
}

export function ensureMapleLiquidityPoolV1(
  poolAddress: Address,
  rewardsContract: Address | null,
): MapleLiquidityPoolV1 {
  let pool = MapleLiquidityPoolV1.load(poolAddress.toHex());

  if (pool != null) {
    if (rewardsContract) {
      pool.rewardsContract = rewardsContract;
      pool.save();
    }

    return pool;
  }

  pool = createMapleLiquidityPoolV1(poolAddress, rewardsContract);

  return pool;
}

export function createMapleLiquidityPoolV2(pool: Address): MapleLiquidityPoolV2 {
  let mapleLiquidityPool = new MapleLiquidityPoolV2(pool.toHex());

  let poolContract = ExternalSdk.bind(pool);
  let liquidityAsset = ensureAsset(poolContract.asset());

  mapleLiquidityPool.liquidityAsset = liquidityAsset.id;
  mapleLiquidityPool.manager = poolContract.manager();
  mapleLiquidityPool.save();

  return mapleLiquidityPool;
}

export function ensureMapleLiquidityPoolV2(poolAddress: Address): MapleLiquidityPoolV2 {
  let pool = MapleLiquidityPoolV2.load(poolAddress.toHex());

  if (pool != null) {
    return pool;
  }

  pool = createMapleLiquidityPoolV2(poolAddress);

  return pool;
}
