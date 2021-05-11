import { uniqueEventId } from '../../../utils/utils/id';
import { ensureAsset } from '../entities/Asset';
import { checkDerivativeType } from '../entities/DerivativeType';
import { ensureTransaction } from '../entities/Transaction';
import {
  DerivativeAdded,
  DerivativeRemoved,
  DerivativeUpdated,
} from '../generated/AggregatedDerivativePriceFeedContract';
import { DerivativeAddedEvent, DerivativeRemovedEvent, DerivativeUpdatedEvent } from '../generated/schema';

export function handleDerivativeAdded(event: DerivativeAdded): void {
  let derivative = ensureAsset(event.params.derivative);
  derivative.removed = false;
  derivative.type = 'DERIVATIVE';
  derivative.save();

  checkDerivativeType(derivative, event.params.priceFeed);

  let derivativeAdded = new DerivativeAddedEvent(uniqueEventId(event));
  derivativeAdded.derivative = derivative.id;
  derivativeAdded.timestamp = event.block.timestamp;
  derivativeAdded.transaction = ensureTransaction(event).id;
  derivativeAdded.priceFeed = event.params.priceFeed.toHex();
  derivativeAdded.save();
}

export function handleDerivativeRemoved(event: DerivativeRemoved): void {
  let derivative = ensureAsset(event.params.derivative);
  derivative.removed = true;
  derivative.save();

  let derivativeRemoved = new DerivativeRemovedEvent(uniqueEventId(event));
  derivativeRemoved.derivative = derivative.id;
  derivativeRemoved.timestamp = event.block.timestamp;
  derivativeRemoved.transaction = ensureTransaction(event).id;
  derivativeRemoved.save();
}

export function handleDerivativeUpdated(event: DerivativeUpdated): void {
  let derivative = ensureAsset(event.params.derivative);

  let derivativeUpdated = new DerivativeUpdatedEvent(uniqueEventId(event));
  derivativeUpdated.derivative = derivative.id;
  derivativeUpdated.timestamp = event.block.timestamp;
  derivativeUpdated.transaction = ensureTransaction(event).id;
  derivativeUpdated.prevPriceFeed = event.params.prevPriceFeed.toHex();
  derivativeUpdated.nextPriceFeed = event.params.nextPriceFeed.toHex();
  derivativeUpdated.save();
}
