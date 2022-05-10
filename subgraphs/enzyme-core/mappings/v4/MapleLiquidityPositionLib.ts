import { arrayDiff, arrayUnique } from '@enzymefinance/subgraph-utils';
import { ensureMapleLiquidityPool } from '../../entities/MapleLiquidityPool';
import { useMapleLiquidityPosition } from '../../entities/MapleLiquidityPosition';
import {
  UsedLendingPoolAdded,
  UsedLendingPoolRemoved,
} from '../../generated/contracts/MapleLiquidityPositionLib4Events';

export function handleUsedLendingPoolAdded(event: UsedLendingPoolAdded): void {
  let mapleLiquidityPosition = useMapleLiquidityPosition(event.address.toHex());

  let pool = ensureMapleLiquidityPool(event.params.lendingPool);

  mapleLiquidityPosition.pools = arrayUnique<string>(mapleLiquidityPosition.pools.concat([pool.id]));
  mapleLiquidityPosition.save();
}
export function handleUsedLendingPoolRemoved(event: UsedLendingPoolRemoved): void {
  let mapleLiquidityPosition = useMapleLiquidityPosition(event.address.toHex());

  let pool = ensureMapleLiquidityPool(event.params.lendingPool);

  mapleLiquidityPosition.pools = arrayDiff<string>(mapleLiquidityPosition.pools, [pool.id]);
  mapleLiquidityPosition.save();
}
