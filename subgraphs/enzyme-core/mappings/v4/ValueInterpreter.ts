import { ensureAsset } from '../../entities/Asset';
import {
  DerivativeAdded,
  DerivativeRemoved,
  EthUsdAggregatorSet,
  PrimitiveAdded,
  PrimitiveRemoved,
  StalePrimitiveRemoved,
  StaleRateThresholdSet,
} from '../../generated/contracts/ValueInterpreter4Events';

export function handleDerivativeAdded(event: DerivativeAdded): void {
  ensureAsset(event.params.derivative);
}

export function handlePrimitiveAdded(event: PrimitiveAdded): void {
  ensureAsset(event.params.primitive);
}

export function handleDerivativeRemoved(event: DerivativeRemoved): void {}
export function handleEthUsdAggregatorSet(event: EthUsdAggregatorSet): void {}
export function handlePrimitiveRemoved(event: PrimitiveRemoved): void {}
export function handleStalePrimitiveRemoved(event: StalePrimitiveRemoved): void {}
export function handleStaleRateThresholdSet(event: StaleRateThresholdSet): void {}
