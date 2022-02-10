import { ensureAsset } from '../entities/Asset';
import { fetchAssetPrice, trackAssetPrice } from '../entities/AssetPrice';
import { checkDerivativeType } from '../entities/DerivativeType';
import { releaseFromPriceFeed } from '../entities/Release';
import { ensureTransaction } from '../entities/Transaction';
import {
  DerivativeAdded,
  DerivativeRemoved,
  DerivativeUpdated,
} from '../generated/AggregatedDerivativePriceFeedContract';
import { DerivativeAddedEvent, DerivativeRemovedEvent, DerivativeUpdatedEvent } from '../generated/schema';
import { arrayDiff } from '../utils/arrayDiff';
import { arrayUnique } from '../utils/arrayUnique';
import { genericId } from '../utils/genericId';

export function handleDerivativeAdded(event: DerivativeAdded): void {
  let derivative = ensureAsset(event.params.derivative);
  derivative.type = 'DERIVATIVE';

  let release = releaseFromPriceFeed(event);
  if (release != null) {
    derivative.releases = arrayUnique<string>(derivative.releases.concat([release.id]));
  }
  derivative.save();

  checkDerivativeType(derivative, event.params.priceFeed);

  let derivativeAdded = new DerivativeAddedEvent(genericId(event));
  derivativeAdded.derivative = derivative.id;
  derivativeAdded.timestamp = event.block.timestamp;
  derivativeAdded.transaction = ensureTransaction(event).id;
  derivativeAdded.priceFeed = event.params.priceFeed.toHex();
  derivativeAdded.save();
}

export function handleDerivativeRemoved(event: DerivativeRemoved): void {
  let derivative = ensureAsset(event.params.derivative);

  let release = releaseFromPriceFeed(event);
  if (release != null) {
    derivative.releases = arrayDiff<string>(derivative.releases, [release.id]);
  }
  derivative.save();

  let derivativeRemoved = new DerivativeRemovedEvent(genericId(event));
  derivativeRemoved.derivative = derivative.id;
  derivativeRemoved.timestamp = event.block.timestamp;
  derivativeRemoved.transaction = ensureTransaction(event).id;
  derivativeRemoved.save();
}

export function handleDerivativeUpdated(event: DerivativeUpdated): void {
  let derivative = ensureAsset(event.params.derivative);

  let derivativeUpdated = new DerivativeUpdatedEvent(genericId(event));
  derivativeUpdated.derivative = derivative.id;
  derivativeUpdated.timestamp = event.block.timestamp;
  derivativeUpdated.transaction = ensureTransaction(event).id;
  derivativeUpdated.prevPriceFeed = event.params.prevPriceFeed.toHex();
  derivativeUpdated.nextPriceFeed = event.params.nextPriceFeed.toHex();
  derivativeUpdated.save();
}
