import { PriceFeedSet } from '../generated/AggregatedDerivativePriceFeedContract';
import { PriceFeedSetEvent } from '../generated/schema';
import { genericId } from '../utils/genericId';
import { ensureAsset } from '../entities/Asset';
import { ensureContract } from '../entities/Contract';
import { ensureTransaction } from '../entities/Transaction';
import { zeroAddress } from '../constants';
import { ensureCron, triggerCron } from '../utils/cronManager';
import { arrayUnique } from '../utils/arrayUnique';
import { arrayDiff } from '../utils/arrayDiff';
import { fetchAssetPrice } from '../utils/valueInterpreter';
import { ensureAssetPrice, trackAssetPrice } from '../entities/AssetPrice';

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

  if (!event.params.nextPriceFeed.equals(zeroAddress)) {
    let current = fetchAssetPrice(derivative);
    trackAssetPrice(derivative, current, event.block.timestamp);
  }

  let cron = ensureCron();
  if (event.params.nextPriceFeed.equals(zeroAddress)) {
    cron.derivatives = arrayDiff<string>(cron.derivatives, [derivative.id]);
  } else {
    cron.derivatives = arrayUnique<string>(cron.derivatives.concat([derivative.id]));
  }
  cron.save();

  // It's important that we run cron last.
  triggerCron(event.block.timestamp);
}
