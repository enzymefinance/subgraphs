import { ZERO_ADDRESS } from '@enzymefinance/subgraph-utils';
import { getOrCreateAsset } from '../../entities/Asset';
import {
  createDerivativeRegistration,
  createPrimitiveRegistration,
  removeDerivativeRegistration,
  removePrimitiveRegistration,
} from '../../entities/Registration';
import { getOrCreateRelease } from '../../entities/Release';
import { releaseV4Address, wethTokenAddress } from '../../generated/configuration';
import {
  DerivativeAdded,
  DerivativeRemoved,
  PrimitiveAdded,
  PrimitiveRemoved,
  StalePrimitiveRemoved,
} from '../../generated/contracts/ValueInterpreter4Events';

export function handleDerivativeAdded(event: DerivativeAdded): void {
  let release = getOrCreateRelease(releaseV4Address);
  let asset = getOrCreateAsset(event.params.derivative);
  createDerivativeRegistration(release, asset, event.params.priceFeed, event);
}

export function handleDerivativeRemoved(event: DerivativeRemoved): void {
  let release = getOrCreateRelease(releaseV4Address);
  let asset = getOrCreateAsset(event.params.derivative);
  removeDerivativeRegistration(release, asset, event);
}

export function handlePrimitiveAdded(event: PrimitiveAdded): void {
  let release = getOrCreateRelease(releaseV4Address);
  let asset = getOrCreateAsset(event.params.primitive);
  createPrimitiveRegistration(release, asset, event.params.aggregator, event);
  // WETH
  let weth = getOrCreateAsset(wethTokenAddress);
  createPrimitiveRegistration(release, weth, ZERO_ADDRESS, event);
}

export function handlePrimitiveRemoved(event: PrimitiveRemoved): void {
  let release = getOrCreateRelease(releaseV4Address);
  let asset = getOrCreateAsset(event.params.primitive);
  removePrimitiveRegistration(release, asset, event);
}

export function handleStalePrimitiveRemoved(event: StalePrimitiveRemoved): void {
  let release = getOrCreateRelease(releaseV4Address);
  let asset = getOrCreateAsset(event.params.primitive);
  removePrimitiveRegistration(release, asset, event);
}
