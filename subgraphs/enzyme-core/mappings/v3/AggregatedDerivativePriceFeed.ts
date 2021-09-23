import { ensureAsset } from '../../entities/Asset';
import {
  DerivativeAdded,
  DerivativeRemoved,
  DerivativeUpdated,
} from '../../generated/contracts/AggregatedDerivativePriceFeed3Events';

export function handleDerivativeAdded(event: DerivativeAdded): void {
  ensureAsset(event.params.derivative);
}

export function handleDerivativeRemoved(event: DerivativeRemoved): void {}

export function handleDerivativeUpdated(event: DerivativeUpdated): void {}
