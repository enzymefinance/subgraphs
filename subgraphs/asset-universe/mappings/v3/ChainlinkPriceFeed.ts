import { getOrCreateAsset } from '../../entities/Asset';
import { createPrimitiveRegistration, removePrimitiveRegistration } from '../../entities/Registration';
import { getOrCreateRelease } from '../../entities/Version';
import { releaseV3Address } from '../../generated/configuration';
import {
  PrimitiveAdded,
  PrimitiveRemoved,
  PrimitiveUpdated,
  StalePrimitiveRemoved,
} from '../../generated/contracts/ChainlinkPriceFeed3Events';

export function handlePrimitiveAdded(event: PrimitiveAdded): void {
  let version = getOrCreateRelease(releaseV3Address);
  let asset = getOrCreateAsset(event.params.primitive);
  createPrimitiveRegistration(version, asset, event.params.aggregator, event);
}

export function handlePrimitiveUpdated(event: PrimitiveUpdated): void {
  let version = getOrCreateRelease(releaseV3Address);
  let asset = getOrCreateAsset(event.params.primitive);
  removePrimitiveRegistration(version, asset, event);
  createPrimitiveRegistration(version, asset, event.params.nextAggregator, event);
}

export function handlePrimitiveRemoved(event: PrimitiveRemoved): void {
  let version = getOrCreateRelease(releaseV3Address);
  let asset = getOrCreateAsset(event.params.primitive);
  removePrimitiveRegistration(version, asset, event);
}

export function handleStalePrimitiveRemoved(event: StalePrimitiveRemoved): void {
  let version = getOrCreateRelease(releaseV3Address);
  let asset = getOrCreateAsset(event.params.primitive);
  removePrimitiveRegistration(version, asset, event);
}
