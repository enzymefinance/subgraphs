import { wethTokenAddress } from '../addresses';
import { zeroAddress } from '../constants';
import { ensureAsset } from '../entities/Asset';
import { trackAssetPrice } from '../entities/AssetPrice';
import {
  disableChainlinkAssetAggregator,
  disableChainlinkEthUsdAggregator,
  enableChainlinkAssetAggregator,
  enableChainlinkEthUsdAggregator,
} from '../entities/ChainlinkAggregator';
import { ensureContract } from '../entities/Contract';
import { ensureTransaction } from '../entities/Transaction';
import { ChainlinkAggregatorContract } from '../generated/ChainlinkAggregatorContract';
import { ChainlinkAggregatorProxyContract } from '../generated/ChainlinkAggregatorProxyContract';
import { EthUsdAggregatorSet, PrimitiveSet, StaleRateThresholdSet } from '../generated/ChainlinkPriceFeedContract';
import { EthUsdAggregatorSetEvent, PrimitiveSetEvent, StaleRateThresholdSetEvent } from '../generated/schema';
import { arrayUnique } from '../utils/arrayUnique';
import { ensureCron, triggerCron } from '../utils/cronManager';
import { genericId } from '../utils/genericId';
import { toBigDecimal } from '../utils/toBigDecimal';

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

export function handlePrimitiveSet(event: PrimitiveSet): void {
  let primitive = ensureAsset(event.params.primitive);
  primitive.type = event.params.nextRateAsset == 1 ? 'USD' : 'ETH';
  primitive.save();

  let primitivePriceFeedSet = new PrimitiveSetEvent(genericId(event));
  primitivePriceFeedSet.primitive = primitive.id;
  primitivePriceFeedSet.contract = ensureContract(event.address, 'ChainlinkPriceFeed').id;
  primitivePriceFeedSet.timestamp = event.block.timestamp;
  primitivePriceFeedSet.transaction = ensureTransaction(event).id;
  primitivePriceFeedSet.prevPriceFeed = event.params.prevAggregator.toHex();
  primitivePriceFeedSet.prevRateAsset = event.params.prevRateAsset;
  primitivePriceFeedSet.nextPriceFeed = event.params.nextAggregator.toHex();
  primitivePriceFeedSet.nextRateAsset = event.params.nextRateAsset;
  primitivePriceFeedSet.save();

  if (!event.params.prevAggregator.equals(zeroAddress)) {
    let proxy = ChainlinkAggregatorProxyContract.bind(event.params.prevAggregator);
    let aggregator = proxy.aggregator();
    disableChainlinkAssetAggregator(aggregator, primitive);
  }

  let proxy = ChainlinkAggregatorProxyContract.bind(event.params.nextAggregator);
  let aggregator = proxy.aggregator();

  // Whenever a new asset is registered, we need to fetch its current price immediately.
  let contract = ChainlinkAggregatorContract.bind(aggregator);
  let current = toBigDecimal(contract.latestAnswer(), primitive.type === 'USD' ? 8 : 18);
  trackAssetPrice(primitive, event.block.timestamp, current);

  // Keep tracking this asset using the registered chainlink aggregator.
  enableChainlinkAssetAggregator(aggregator, primitive);

  let cron = ensureCron();
  cron.primitives = arrayUnique<string>(cron.primitives.concat([primitive.id]));
  cron.save();

  // It's important that we run cron last.
  triggerCron(event.block.timestamp);
}

export function handleEthUsdAggregatorSet(event: EthUsdAggregatorSet): void {
  let ethUsdAggregatorSet = new EthUsdAggregatorSetEvent(genericId(event));
  ethUsdAggregatorSet.contract = ensureContract(event.address, 'ChainlinkPriceFeed').id;
  ethUsdAggregatorSet.timestamp = event.block.timestamp;
  ethUsdAggregatorSet.transaction = ensureTransaction(event).id;
  ethUsdAggregatorSet.prevEthUsdAggregator = event.params.prevEthUsdAggregator.toHex();
  ethUsdAggregatorSet.nextEthUsdAggregator = event.params.nextEthUsdAggregator.toHex();
  ethUsdAggregatorSet.save();

  if (!event.params.prevEthUsdAggregator.equals(zeroAddress)) {
    let proxy = ChainlinkAggregatorProxyContract.bind(event.params.prevEthUsdAggregator);
    let aggregator = proxy.aggregator();
    disableChainlinkEthUsdAggregator(aggregator);
  }

  let proxy = ChainlinkAggregatorProxyContract.bind(event.params.nextEthUsdAggregator);
  let aggregator = proxy.aggregator();
  enableChainlinkEthUsdAggregator(aggregator);

  // We need to create WETH manually
  let weth = ensureAsset(wethTokenAddress);
  weth.type = 'ETH';
  weth.save();

  // It's important that we run cron last.
  triggerCron(event.block.timestamp);
}

export function handleStaleRateThresholdSet(event: StaleRateThresholdSet): void {
  let rateSet = new StaleRateThresholdSetEvent(genericId(event));
  rateSet.contract = ensureContract(event.address, 'ChainlinkPriceFeed').id;
  rateSet.timestamp = event.block.timestamp;
  rateSet.transaction = ensureTransaction(event).id;
  rateSet.nextStaleRateThreshold = event.params.nextStaleRateThreshold;
  rateSet.prevStaleRateThreshold = event.params.prevStaleRateThreshold;
  rateSet.save();
}
