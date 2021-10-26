import { getOrCreateAsset } from '../../entities/Asset';
import { createPrimitiveRegistration, removePrimitiveRegistration } from '../../entities/Registration';
import { getOrCreateRelease } from '../../entities/Release';
import { releaseV2Address } from '../../generated/configuration';
import {
  PrimitiveAdded,
  PrimitiveRemoved,
  PrimitiveUpdated,
  StalePrimitiveRemoved,
} from '../../generated/contracts/ChainlinkPriceFeed2Events';

export function handlePrimitiveAdded(event: PrimitiveAdded): void {
  let release = getOrCreateRelease(releaseV2Address);
  let asset = getOrCreateAsset(event.params.primitive);
  createPrimitiveRegistration(release, asset, event.params.aggregator, event);
}

export function handlePrimitiveUpdated(event: PrimitiveUpdated): void {
  let release = getOrCreateRelease(releaseV2Address);
  let asset = getOrCreateAsset(event.params.primitive);
  removePrimitiveRegistration(release, asset, event);
  createPrimitiveRegistration(release, asset, event.params.nextAggregator, event);
}

export function handlePrimitiveRemoved(event: PrimitiveRemoved): void {
  let release = getOrCreateRelease(releaseV2Address);
  let asset = getOrCreateAsset(event.params.primitive);
  removePrimitiveRegistration(release, asset, event);
}

export function handleStalePrimitiveRemoved(event: StalePrimitiveRemoved): void {
  let release = getOrCreateRelease(releaseV2Address);
  let asset = getOrCreateAsset(event.params.primitive);
  removePrimitiveRegistration(release, asset, event);
}
