import { PriceFeedSet } from '../generated/AggregatedDerivativePriceFeedContract';
import { PriceFeedSetEvent } from '../generated/schema';
import { genericId } from '../utils/genericId';
import { ensureAsset } from '../entities/Asset';
import { ensureContract } from '../entities/Contract';
import { ensureTransaction } from '../entities/Transaction';
import { zeroAddress } from '../constants';

export function handlePriceFeedSet(event: PriceFeedSet): void {
  let derivative = ensureAsset(event.params.derivative);

  let derivativePriceFeedSet = new PriceFeedSetEvent(genericId(event));
  derivativePriceFeedSet.derivative = derivative.id;
  derivativePriceFeedSet.contract = ensureContract(event.address, 'AggregatedDerivativePriceFeed').id;
  derivativePriceFeedSet.timestamp = event.block.timestamp;
  derivativePriceFeedSet.transaction = ensureTransaction(event).id;
  derivativePriceFeedSet.prevPriceFeed = event.params.prevPriceFeed.toHex();
  derivativePriceFeedSet.nextPriceFeed = event.params.nextPriceFeed.toHex();
  derivativePriceFeedSet.save();

  if (event.params.nextPriceFeed.equals(zeroAddress)) {
    derivative.active = false;
    derivative.save();
  } else {
    derivative.active = true;
    derivative.save();
  }
}
