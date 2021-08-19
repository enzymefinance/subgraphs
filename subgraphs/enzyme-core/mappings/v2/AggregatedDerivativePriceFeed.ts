import { ensureAsset } from '../../entities/Asset';
import {
  DerivativeAdded,
  DerivativeRemoved,
  DerivativeUpdated,
} from '../../generated/AggregatedDerivativePriceFeed2Contract';

export function handleDerivativeAdded(event: DerivativeAdded): void {
  ensureAsset(event.params.derivative);
}

export function handleDerivativeRemoved(event: DerivativeRemoved): void {}

export function handleDerivativeUpdated(event: DerivativeUpdated): void {}
