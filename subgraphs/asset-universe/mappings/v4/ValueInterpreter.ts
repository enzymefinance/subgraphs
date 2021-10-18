import {
  DerivativeAdded,
  DerivativeRemoved,
  PrimitiveAdded,
  PrimitiveRemoved,
  StalePrimitiveRemoved,
} from '../../generated/contracts/ValueInterpreter4Events';
import {
  createDerivativeRegistration,
  createPrimitiveRegistration,
  removeDerivativeRegistration,
  removePrimitiveRegistration,
} from '../../entities/Registration';
import { releaseV4Address } from '../../generated/configuration';
import { getOrCreateVersion } from '../../entities/Version';
import { getOrCreateAsset } from '../../entities/Asset';

export function handleDerivativeAdded(event: DerivativeAdded): void {
  let version = getOrCreateVersion(releaseV4Address);
  let asset = getOrCreateAsset(event.params.derivative, version);
  createDerivativeRegistration(version, asset, event.params.priceFeed, event);
}

export function handleDerivativeRemoved(event: DerivativeRemoved): void {
  let version = getOrCreateVersion(releaseV4Address);
  let asset = getOrCreateAsset(event.params.derivative, version);
  removeDerivativeRegistration(version, asset, event);
}

export function handlePrimitiveAdded(event: PrimitiveAdded): void {
  let version = getOrCreateVersion(releaseV4Address);
  let asset = getOrCreateAsset(event.params.primitive, version);
  createPrimitiveRegistration(version, asset, event.params.aggregator, event);
}

export function handlePrimitiveRemoved(event: PrimitiveRemoved): void {
  let version = getOrCreateVersion(releaseV4Address);
  let asset = getOrCreateAsset(event.params.primitive, version);
  removePrimitiveRegistration(version, asset, event);
}

export function handleStalePrimitiveRemoved(event: StalePrimitiveRemoved): void {
  let version = getOrCreateVersion(releaseV4Address);
  let asset = getOrCreateAsset(event.params.primitive, version);
  removePrimitiveRegistration(version, asset, event);
}
