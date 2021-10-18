import {
  PrimitiveAdded,
  PrimitiveUpdated,
  PrimitiveRemoved,
  StalePrimitiveRemoved,
} from '../../generated/contracts/ChainlinkPriceFeed2Events';
import { createPrimitiveRegistration, removePrimitiveRegistration } from '../../entities/Registration';
import { releaseV2Address } from '../../generated/configuration';
import { getOrCreateAsset } from '../../entities/Asset';
import { getOrCreateVersion } from '../../entities/Version';

export function handlePrimitiveAdded(event: PrimitiveAdded): void {
  let version = getOrCreateVersion(releaseV2Address);
  let asset = getOrCreateAsset(event.params.primitive, version);
  createPrimitiveRegistration(version, asset, event.params.aggregator, event);
}

export function handlePrimitiveUpdated(event: PrimitiveUpdated): void {
  let version = getOrCreateVersion(releaseV2Address);
  let asset = getOrCreateAsset(event.params.primitive, version);
  removePrimitiveRegistration(version, asset, event);
  createPrimitiveRegistration(version, asset, event.params.nextAggregator, event);
}

export function handlePrimitiveRemoved(event: PrimitiveRemoved): void {
  let version = getOrCreateVersion(releaseV2Address);
  let asset = getOrCreateAsset(event.params.primitive, version);
  removePrimitiveRegistration(version, asset, event);
}

export function handleStalePrimitiveRemoved(event: StalePrimitiveRemoved): void {
  let version = getOrCreateVersion(releaseV2Address);
  let asset = getOrCreateAsset(event.params.primitive, version);
  removePrimitiveRegistration(version, asset, event);
}
