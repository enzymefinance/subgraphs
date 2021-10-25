import { getOrCreateAsset } from '../../entities/Asset';
import { createDerivativeRegistration, removeDerivativeRegistration } from '../../entities/Registration';
import { getOrCreateRelease } from '../../entities/Version';
import { releaseV3Address } from '../../generated/configuration';
import { DerivativeAdded, DerivativeRemoved } from '../../generated/contracts/AggregatedDerivativePriceFeed3Events';

export function handleDerivativeAdded(event: DerivativeAdded): void {
  let version = getOrCreateRelease(releaseV3Address);
  let asset = getOrCreateAsset(event.params.derivative);
  createDerivativeRegistration(version, asset, event.params.priceFeed, event);
}

export function handleDerivativeRemoved(event: DerivativeRemoved): void {
  let version = getOrCreateRelease(releaseV3Address);
  let asset = getOrCreateAsset(event.params.derivative);
  removeDerivativeRegistration(version, asset, event);
}
