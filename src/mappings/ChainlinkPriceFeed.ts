import { AggregatorSet } from '../generated/ChainlinkPriceFeedContract';
import { AggregatorSetEvent } from '../generated/schema';
import { ensureContract } from '../entities/Contract';
import { ensureTransaction } from '../entities/Transaction';
import { ensureAsset } from '../entities/Asset';
import { genericId } from '../utils/genericId';
import { zeroAddress } from '../constants';
import { disableChainlinkAggregator, enableChainlinkAggregator } from '../entities/ChainlinkAggregator';
import { ensureCron, triggerCron } from '../utils/cronManager';
import { arrayDiff } from '../utils/arrayDiff';
import { arrayUnique } from '../utils/arrayUnique';
import { ChainlinkAggregatorContract } from '../generated/ChainlinkAggregatorContract';
import { trackAssetPrice } from '../entities/AssetPrice';
import { toBigDecimal } from '../utils/toBigDecimal';

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
    // Whenever a new asset is registered, we need to fetch its current price immediately.
    let contract = ChainlinkAggregatorContract.bind(event.params.nextAggregator);
    let current = toBigDecimal(contract.latestAnswer(), primitive.decimals);
    trackAssetPrice(primitive, current, event.block.timestamp);

    // Keep tracking this asset using the registered chainlink aggregator.
    enableChainlinkAggregator(event.params.nextAggregator, primitive);
  }

  let cron = ensureCron();
  if (event.params.nextAggregator.equals(zeroAddress)) {
    cron.primitives = arrayDiff<string>(cron.derivatives, [primitive.id]);
  } else {
    cron.primitives = arrayUnique<string>(cron.primitives.concat([primitive.id]));
  }
  cron.save();

  // It's important that we run cron last.
  triggerCron(event.block.timestamp);
}
