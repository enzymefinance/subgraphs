import { PriceFeedSet } from '../generated/AggregatedDerivativePriceFeedContract';
import { DerivativePriceFeedSet } from '../generated/schema';
import { genericId } from '../utils/genericId';
import { ensureAsset } from '../entities/Asset';
import { ensureContract } from '../entities/Contract';
import { ensurePriceFeed } from '../entities/PriceFeed';
import { ensureTransaction } from '../entities/Transaction';
import { zeroAddress } from '../constants';

export function handlePriceFeedSet(event: PriceFeedSet): void {
  let derivativePriceFeedSet = new DerivativePriceFeedSet(genericId(event));
  let derivative = ensureAsset(event.params.derivative);

  if (!event.params.prevPriceFeed.equals(zeroAddress)) {
    let prevPriceFeed = ensurePriceFeed(event.params.prevPriceFeed);
    prevPriceFeed.asset = derivative.id;
    prevPriceFeed.current = false;
    prevPriceFeed.currentEnd = event.block.timestamp;
    prevPriceFeed.save();

    derivativePriceFeedSet.prevPriceFeed = prevPriceFeed.id;
  }

  let nextPriceFeed = ensurePriceFeed(event.params.nextPriceFeed);
  nextPriceFeed.asset = derivative.id;
  nextPriceFeed.current = true;
  nextPriceFeed.currentStart = event.block.timestamp;
  nextPriceFeed.save();

  derivativePriceFeedSet.derivative = derivative.id;
  derivativePriceFeedSet.nextPriceFeed = nextPriceFeed.id;
  derivativePriceFeedSet.contract = ensureContract(event.address, 'DerivativePriceFeedSet', event.block.timestamp).id;
  derivativePriceFeedSet.timestamp = event.block.timestamp;
  derivativePriceFeedSet.transaction = ensureTransaction(event).id;

  derivativePriceFeedSet.save();
}
