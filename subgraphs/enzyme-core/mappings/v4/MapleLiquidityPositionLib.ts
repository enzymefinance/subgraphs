import { arrayDiff, arrayUnique } from '@enzymefinance/subgraph-utils';
import { ensureMapleLiquidityPoolV2 } from '../../entities/MapleLiquidityPool';
import { useMapleLiquidityPosition } from '../../entities/MapleLiquidityPosition';
import {
  MigrationAirdropThresholdNotMet,
  PoolTokenV1BalanceSnapshotSet,
  UsedLendingPoolAdded,
  UsedLendingPoolRemoved,
} from '../../generated/contracts/MapleLiquidityPositionLib4Events';

export function handleUsedLendingPoolAdded(event: UsedLendingPoolAdded): void {}
export function handleUsedLendingPoolRemoved(event: UsedLendingPoolRemoved): void {}

export function handleUsedLendingPoolV2Added(event: UsedLendingPoolAdded): void {
  let mapleLiquidityPosition = useMapleLiquidityPosition(event.address.toHex());

  let pool = ensureMapleLiquidityPoolV2(event.params.lendingPool);

  mapleLiquidityPosition.pools = arrayUnique<string>(mapleLiquidityPosition.pools.concat([pool.id]));
  mapleLiquidityPosition.save();
}

export function handleUsedLendingPoolV2Removed(event: UsedLendingPoolRemoved): void {
  let mapleLiquidityPosition = useMapleLiquidityPosition(event.address.toHex());
  let pool = ensureMapleLiquidityPoolV2(event.params.lendingPool);
  mapleLiquidityPosition.pools = arrayDiff<string>(mapleLiquidityPosition.pools, [pool.id]);
  mapleLiquidityPosition.save();
}

export function handleMigrationAirdropThresholdNotMet(event: MigrationAirdropThresholdNotMet): void {}

export function handlePoolTokenV1BalanceSnapshotSet(event: PoolTokenV1BalanceSnapshotSet): void {}
