import { ensureAsset } from '../../entities/Asset';
import {
  EthUsdAggregatorSet,
  PrimitiveAdded,
  PrimitiveRemoved,
  PrimitiveUpdated,
} from '../../generated/contracts/ChainlinkPriceFeed2Events';

export function handleEthUsdAggregatorSet(event: EthUsdAggregatorSet): void {}

export function handlePrimitiveAdded(event: PrimitiveAdded): void {
  ensureAsset(event.params.primitive);
}

export function handlePrimitiveRemoved(event: PrimitiveRemoved): void {}

export function handlePrimitiveUpdated(event: PrimitiveUpdated): void {}
