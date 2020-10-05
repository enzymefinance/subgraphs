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
import { ChainlinkAggregatorProxyContract } from '../generated/ChainlinkAggregatorProxyContract';

// TODO: Chainlink uses proxies for their price oracles. Sadly, these proxies do not
// emit events whenever the underlying aggregator changes. Chainlink has proposed that
// they could add a central registry that emits an event whenever an aggregator changes.
//
// If they can't make this happen, an alternative solution could be to monitor these
// changes (through contract calls) either as part of cron or by checking and comparing
// the current aggregator whenever we track an AnswerUpdated event and swap out the
// underlying aggregator whenever we observe a change. This would be possible because
// chainlink (allegedly) keeps updating the "old" aggregator for a limited amount of time
// even after they've migrated to a new one and pointed the proxy to the new aggregator.
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
    let proxy = ChainlinkAggregatorProxyContract.bind(event.params.prevAggregator);
    let aggregator = proxy.aggregator();

    disableChainlinkAggregator(aggregator, primitive);
  }

  if (!event.params.nextAggregator.equals(zeroAddress)) {
    let proxy = ChainlinkAggregatorProxyContract.bind(event.params.nextAggregator);
    let aggregator = proxy.aggregator();

    // Whenever a new asset is registered, we need to fetch its current price immediately.
    let contract = ChainlinkAggregatorContract.bind(aggregator);
    let current = toBigDecimal(contract.latestAnswer(), primitive.decimals);
    trackAssetPrice(primitive, event.block.timestamp, current);

    // Keep tracking this asset using the registered chainlink aggregator.
    enableChainlinkAggregator(aggregator, primitive);
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
