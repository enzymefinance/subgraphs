import { getOrCreateAsset } from '../../entities/Asset';
import {
  createDerivativeRegistration,
  createPrimitiveRegistration,
  removeDerivativeRegistration,
  removePrimitiveRegistration,
} from '../../entities/Registration';
import { getOrCreateRelease } from '../../entities/Version';
import { releaseV4Address } from '../../generated/configuration';
import {
  DerivativeAdded,
  DerivativeRemoved,
  PrimitiveAdded,
  PrimitiveRemoved,
  StalePrimitiveRemoved,
} from '../../generated/contracts/ValueInterpreter4Events';

export function handleDerivativeAdded(event: DerivativeAdded): void {
  let version = getOrCreateRelease(releaseV4Address);
  let asset = getOrCreateAsset(event.params.derivative);
  createDerivativeRegistration(version, asset, event.params.priceFeed, event);
}

export function handleDerivativeRemoved(event: DerivativeRemoved): void {
  let version = getOrCreateRelease(releaseV4Address);
  let asset = getOrCreateAsset(event.params.derivative);
  removeDerivativeRegistration(version, asset, event);
}

export function handlePrimitiveAdded(event: PrimitiveAdded): void {
  let version = getOrCreateRelease(releaseV4Address);
  let asset = getOrCreateAsset(event.params.primitive);
  createPrimitiveRegistration(version, asset, event.params.aggregator, event);
}

export function handlePrimitiveRemoved(event: PrimitiveRemoved): void {
  let version = getOrCreateRelease(releaseV4Address);
  let asset = getOrCreateAsset(event.params.primitive);
  removePrimitiveRegistration(version, asset, event);
}

export function handleStalePrimitiveRemoved(event: StalePrimitiveRemoved): void {
  let version = getOrCreateRelease(releaseV4Address);
  let asset = getOrCreateAsset(event.params.primitive);
  removePrimitiveRegistration(version, asset, event);
}
