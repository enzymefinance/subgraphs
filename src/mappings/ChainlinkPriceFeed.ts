import { AggregatorSet } from '../generated/ChainlinkPriceFeedContract';
import { AggregatorSetEvent } from '../generated/schema';
import { ensureContract } from '../entities/Contract';
import { ensurePriceFeed } from '../entities/PriceFeed';
import { ensureTransaction } from '../entities/Transaction';
import { ensureAsset } from '../entities/Asset';
import { genericId } from '../utils/genericId';
import { zeroAddress } from '../constants';
import { arrayUnique } from '../utils/arrayUnique';

export function handleAggregatorSet(event: AggregatorSet): void {
  let primitivePriceFeedSet = new AggregatorSetEvent(genericId(event));
  let nextPriceFeed = ensurePriceFeed(event.params.nextAggregator);

  let primitive = ensureAsset(event.params.primitive);

  // Assign our primitive its new price feed
  primitive.priceFeed = nextPriceFeed.id;
  primitive.save();

  if (!event.params.prevAggregator.equals(zeroAddress)) {
    let prevPriceFeed = ensurePriceFeed(event.params.prevAggregator);

    // Only add asset to pricefeed.asset array if it isn't there already
    prevPriceFeed.assets = arrayUnique<string>(prevPriceFeed.assets.concat([primitive.id]));

    prevPriceFeed.save();
    primitivePriceFeedSet.prevPriceFeed = prevPriceFeed.id;
  }

  // Only add asset to pricefeed.asset array if it isn't there already
  nextPriceFeed.assets = arrayUnique<string>(nextPriceFeed.assets.concat([primitive.id]));
  nextPriceFeed.save();

  primitivePriceFeedSet.primitive = primitive.id;
  primitivePriceFeedSet.nextPriceFeed = nextPriceFeed.id;
  primitivePriceFeedSet.contract = ensureContract(event.address, 'ChainlinkPriceFeed', event).id;
  primitivePriceFeedSet.timestamp = event.block.timestamp;
  primitivePriceFeedSet.transaction = ensureTransaction(event).id;

  primitivePriceFeedSet.save();
}
