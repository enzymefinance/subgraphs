import { ensureAsset } from '../../entities/Asset';
import {
  DerivativeAdded,
  DerivativeRemoved,
  DerivativeUpdated,
} from '../../generated/contracts/AggregatedDerivativePriceFeed2Events';

export function handleDerivativeAdded(event: DerivativeAdded): void {
  ensureAsset(event.params.derivative);
}

export function handleDerivativeRemoved(event: DerivativeRemoved): void {}

export function handleDerivativeUpdated(event: DerivativeUpdated): void {}
