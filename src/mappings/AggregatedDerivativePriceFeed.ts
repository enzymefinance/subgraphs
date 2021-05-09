import { ensureAsset } from '../entities/Asset';
import { fetchAssetPrice, trackAssetPrice } from '../entities/AssetPrice';
import { checkDerivativeType } from '../entities/DerivativeType';
import { ensureTransaction } from '../entities/Transaction';
import {
  DerivativeAdded,
  DerivativeRemoved,
  DerivativeUpdated,
} from '../generated/AggregatedDerivativePriceFeedContract';
import { DerivativeAddedEvent, DerivativeRemovedEvent, DerivativeUpdatedEvent } from '../generated/schema';
import { arrayDiff } from '../utils/arrayDiff';
import { arrayUnique } from '../utils/arrayUnique';
import { ensureCron, triggerCron } from '../utils/cronManager';
import { genericId } from '../utils/genericId';

let temporaryDerivatives: Array<string> = [
  '0x0258f474786ddfd37abce6df6bbb1dd5dfc4434a',
  '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
  '0x607f4c5bb672230e8672085532f7e901544a7375',
  '0xa0b73e1ff0b80914ab6fe0444e65848c4c34450b',
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  '0xdac17f958d2ee523a2206206994597c13d831ec7',
];

export function handleDerivativeAdded(event: DerivativeAdded): void {
  let derivative = ensureAsset(event.params.derivative);
  derivative.removed = false;
  derivative.save();

  for (let i: i32 = 0; i < temporaryDerivatives.length; i++) {
    if (derivative.id == temporaryDerivatives[i]) {
      return;
    }
  }

  derivative.type = 'DERIVATIVE';
  derivative.save();

  checkDerivativeType(derivative, event.params.priceFeed);

  let derivativeAdded = new DerivativeAddedEvent(genericId(event));
  derivativeAdded.derivative = derivative.id;
  derivativeAdded.timestamp = event.block.timestamp;
  derivativeAdded.transaction = ensureTransaction(event).id;
  derivativeAdded.priceFeed = event.params.priceFeed.toHex();
  derivativeAdded.save();

  // Whenever a new asset is registered, we need to fetch its current price immediately.
  let current = fetchAssetPrice(derivative);
  trackAssetPrice(derivative, event.block.timestamp, current);

  let cron = ensureCron();
  cron.derivatives = arrayUnique<string>(cron.derivatives.concat([derivative.id]));
  cron.save();

  // It's important that we run cron last.
  triggerCron(event.block.timestamp);
}

export function handleDerivativeRemoved(event: DerivativeRemoved): void {
  let derivative = ensureAsset(event.params.derivative);
  derivative.removed = true;
  derivative.save();

  let derivativeRemoved = new DerivativeRemovedEvent(genericId(event));
  derivativeRemoved.derivative = derivative.id;
  derivativeRemoved.timestamp = event.block.timestamp;
  derivativeRemoved.transaction = ensureTransaction(event).id;
  derivativeRemoved.save();

  let cron = ensureCron();
  cron.derivatives = arrayDiff<string>(cron.derivatives, [derivative.id]);
  cron.save();

  // It's important that we run cron last.
  triggerCron(event.block.timestamp);
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

  // Whenever a new asset is registered, we need to fetch its current price immediately.
  let current = fetchAssetPrice(derivative);
  trackAssetPrice(derivative, event.block.timestamp, current);

  // It's important that we run cron last.
  triggerCron(event.block.timestamp);
}
