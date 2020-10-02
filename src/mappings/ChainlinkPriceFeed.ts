import { AggregatorSet } from '../generated/ChainlinkPriceFeedContract';
import { AggregatorSetEvent } from '../generated/schema';
import { ensureContract } from '../entities/Contract';
import { ensureTransaction } from '../entities/Transaction';
import { ensureAsset } from '../entities/Asset';
import { genericId } from '../utils/genericId';
import { zeroAddress } from '../constants';
import { disableChainlinkAggregator, enableChainlinkAggregator } from '../entities/ChainlinkAggregator';

export function handleAggregatorSet(event: AggregatorSet): void {
  let primitive = ensureAsset(event.params.primitive);

  let primitivePriceFeedSet = new AggregatorSetEvent(genericId(event));
  primitivePriceFeedSet.primitive = primitive.id;
  primitivePriceFeedSet.contract = ensureContract(event.address, 'ChainlinkPriceFeed').id;
  primitivePriceFeedSet.timestamp = event.block.timestamp;
  primitivePriceFeedSet.transaction = ensureTransaction(event).id;
  primitivePriceFeedSet.prevPriceFeed = event.params.prevAggregator.toHex();
  primitivePriceFeedSet.nextPriceFeed = event.params.nextAggregator.toHex();
  primitivePriceFeedSet.save();

  if (!event.params.prevAggregator.equals(zeroAddress)) {
    disableChainlinkAggregator(event.params.prevAggregator, primitive);
  }

  if (!event.params.nextAggregator.equals(zeroAddress)) {
    enableChainlinkAggregator(event.params.nextAggregator, primitive);
  }

  if (event.params.nextAggregator.equals(zeroAddress)) {
    primitive.active = false;
    primitive.save();
  } else {
    primitive.active = true;
    primitive.save();
  }
}
