import { DerivativeAdded, DerivativeRemoved } from '../../generated/contracts/AggregatedDerivativePriceFeed2Events';
import { createDerivativeRegistration, removeDerivativeRegistration } from '../../entities/Registration';
import { releaseV2Address } from '../../generated/configuration';
import { getOrCreateVersion } from '../../entities/Version';
import { getOrCreateAsset } from '../../entities/Asset';

export function handleDerivativeAdded(event: DerivativeAdded): void {
  let version = getOrCreateVersion(releaseV2Address);
  let asset = getOrCreateAsset(event.params.derivative, version);
  createDerivativeRegistration(version, asset, event.params.priceFeed, event);
}

export function handleDerivativeRemoved(event: DerivativeRemoved): void {
  let version = getOrCreateVersion(releaseV2Address);
  let asset = getOrCreateAsset(event.params.derivative, version);
  removeDerivativeRegistration(version, asset, event);
}
