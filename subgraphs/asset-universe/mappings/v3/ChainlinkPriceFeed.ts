import {
  PrimitiveAdded,
  PrimitiveUpdated,
  PrimitiveRemoved,
  StalePrimitiveRemoved,
} from '../../generated/contracts/ChainlinkPriceFeed3Events';
import { createPrimitiveRegistration, removePrimitiveRegistration } from '../../entities/Registration';
import { releaseV3Address } from '../../generated/configuration';
import { getOrCreateVersion } from '../../entities/Version';
import { getOrCreateAsset } from '../../entities/Asset';

export function handlePrimitiveAdded(event: PrimitiveAdded): void {
  let version = getOrCreateVersion(releaseV3Address);
  let asset = getOrCreateAsset(event.params.primitive);
  createPrimitiveRegistration(version, asset, event.params.aggregator, event);
}

export function handlePrimitiveUpdated(event: PrimitiveUpdated): void {
  let version = getOrCreateVersion(releaseV3Address);
  let asset = getOrCreateAsset(event.params.primitive);
  removePrimitiveRegistration(version, asset, event);
  createPrimitiveRegistration(version, asset, event.params.nextAggregator, event);
}

export function handlePrimitiveRemoved(event: PrimitiveRemoved): void {
  let version = getOrCreateVersion(releaseV3Address);
  let asset = getOrCreateAsset(event.params.primitive);
  removePrimitiveRegistration(version, asset, event);
}

export function handleStalePrimitiveRemoved(event: StalePrimitiveRemoved): void {
  let version = getOrCreateVersion(releaseV3Address);
  let asset = getOrCreateAsset(event.params.primitive);
  removePrimitiveRegistration(version, asset, event);
}
