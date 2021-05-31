import { Address, BigDecimal } from '@graphprotocol/graph-ts';
import {
  audChainlinkAggregatorAddress,
  btcChainlinkAggregatorAddress,
  chfChainlinkAggregatorAddress,
  eurChainlinkAggregatorAddress,
  gbpChainlinkAggregatorAddress,
  jpyChainlinkAggregatorAddress,
  wethTokenAddress,
} from '../addresses';
import { zeroAddress } from '../constants';
import { ensureAsset } from '../entities/Asset';
import { trackAssetPrice } from '../entities/AssetPrice';
import {
  ensureChainlinkAssetAggregatorProxy,
  ensureChainlinkCurrencyAggregatorProxy,
  ensureChainlinkEthUsdAggregatorProxy,
} from '../entities/ChainlinkAggregatorProxy';
import { ensureCurrency } from '../entities/Currency';
import { trackCurrencyPrice } from '../entities/CurrencyPrice';
import { ensureNetwork } from '../entities/Network';
import { releaseFromPriceFeed } from '../entities/Release';
import { ensureTransaction } from '../entities/Transaction';
import { ChainlinkAggregatorContract } from '../generated/ChainlinkAggregatorContract';
import { ChainlinkAggregatorProxyContract } from '../generated/ChainlinkAggregatorProxyContract';
import {
  EthUsdAggregatorSet,
  PrimitiveAdded,
  PrimitiveRemoved,
  PrimitiveUpdated,
} from '../generated/ChainlinkPriceFeedContract';
import {
  AggregatorUpdatedEvent,
  EthUsdAggregatorSetEvent,
  PrimitiveAddedEvent,
  PrimitiveRemovedEvent,
} from '../generated/schema';
import { arrayDiff } from '../utils/arrayDiff';
import { arrayUnique } from '../utils/arrayUnique';
import { ensureCron, triggerCron } from '../utils/cronManager';
import { genericId } from '../utils/genericId';
import { toBigDecimal } from '../utils/toBigDecimal';

export function unwrapAggregator(address: Address): Address {
  let aggregator = address;

  while (true) {
    let contract = ChainlinkAggregatorProxyContract.bind(aggregator);
    let result = contract.try_aggregator();

    if (result.reverted || result.value.equals(zeroAddress) || result.value.equals(aggregator)) {
      break;
    }

    aggregator = result.value;
  }

  return aggregator;
}

export function handleEthUsdAggregatorSet(event: EthUsdAggregatorSet): void {
  // NOTE: This is the first event on mainnet, so we need to register the network and the release
  ensureNetwork(event);

  let release = releaseFromPriceFeed(event);

  let ethUsdAggregatorSet = new EthUsdAggregatorSetEvent(genericId(event));
  ethUsdAggregatorSet.timestamp = event.block.timestamp;
  ethUsdAggregatorSet.transaction = ensureTransaction(event).id;
  ethUsdAggregatorSet.prevEthUsdAggregator = event.params.prevEthUsdAggregator.toHex();
  ethUsdAggregatorSet.nextEthUsdAggregator = event.params.nextEthUsdAggregator.toHex();
  ethUsdAggregatorSet.save();

  let ethProxy = event.params.nextEthUsdAggregator;
  let ethAggregator = unwrapAggregator(event.params.nextEthUsdAggregator);
  let eth = ensureCurrency('ETH');
  let ethAggregatorContract = ChainlinkAggregatorContract.bind(ethAggregator);
  let ethCurrentPrice = toBigDecimal(ethAggregatorContract.latestAnswer(), 8);
  trackCurrencyPrice(eth, event.block.timestamp, ethCurrentPrice);
  ensureChainlinkEthUsdAggregatorProxy(ethProxy, ethAggregator, eth);

  // Create WETH manually
  let weth = ensureAsset(wethTokenAddress);
  weth.type = 'ETH';
  if (release != null) {
    weth.releases = arrayUnique<string>(weth.releases.concat([release.id]));
  }
  weth.save();

  // Aggregators for currencies
  let audProxy = audChainlinkAggregatorAddress;
  let audAggregator = unwrapAggregator(audChainlinkAggregatorAddress);
  let aud = ensureCurrency('AUD');
  let audAggregatorContract = ChainlinkAggregatorContract.bind(audAggregator);
  let audCurrentPrice = toBigDecimal(audAggregatorContract.latestAnswer(), 8);
  trackCurrencyPrice(aud, event.block.timestamp, audCurrentPrice);
  ensureChainlinkCurrencyAggregatorProxy(audProxy, audAggregator, aud);

  let btcProxy = btcChainlinkAggregatorAddress;
  let btcAggregator = unwrapAggregator(btcChainlinkAggregatorAddress);
  let btc = ensureCurrency('BTC');
  let btcAggregatorContract = ChainlinkAggregatorContract.bind(btcAggregator);
  let btcCurrentPrice = toBigDecimal(btcAggregatorContract.latestAnswer(), 8);
  trackCurrencyPrice(btc, event.block.timestamp, btcCurrentPrice);
  ensureChainlinkCurrencyAggregatorProxy(btcProxy, btcAggregator, btc);

  let chfProxy = chfChainlinkAggregatorAddress;
  let chfAggregator = unwrapAggregator(chfChainlinkAggregatorAddress);
  let chf = ensureCurrency('CHF');
  let chfAggregatorContract = ChainlinkAggregatorContract.bind(chfAggregator);
  let chfCurrentPrice = toBigDecimal(chfAggregatorContract.latestAnswer(), 8);
  trackCurrencyPrice(chf, event.block.timestamp, chfCurrentPrice);
  ensureChainlinkCurrencyAggregatorProxy(chfProxy, chfAggregator, chf);

  let eurProxy = eurChainlinkAggregatorAddress;
  let eurAggregator = unwrapAggregator(eurChainlinkAggregatorAddress);
  let eur = ensureCurrency('EUR');
  let eurAggregatorContract = ChainlinkAggregatorContract.bind(eurAggregator);
  let eurCurrentPrice = toBigDecimal(eurAggregatorContract.latestAnswer(), 8);
  trackCurrencyPrice(eur, event.block.timestamp, eurCurrentPrice);
  ensureChainlinkCurrencyAggregatorProxy(eurProxy, eurAggregator, eur);

  let gbpProxy = gbpChainlinkAggregatorAddress;
  let gbpAggregator = unwrapAggregator(gbpChainlinkAggregatorAddress);
  let gbp = ensureCurrency('GBP');
  let gbpAggregatorContract = ChainlinkAggregatorContract.bind(gbpAggregator);
  let gbpCurrentPrice = toBigDecimal(gbpAggregatorContract.latestAnswer(), 8);
  trackCurrencyPrice(gbp, event.block.timestamp, gbpCurrentPrice);
  ensureChainlinkCurrencyAggregatorProxy(gbpProxy, gbpAggregator, gbp);

  let jpyProxy = jpyChainlinkAggregatorAddress;
  let jpyAggregator = unwrapAggregator(jpyChainlinkAggregatorAddress);
  let jpy = ensureCurrency('JPY');
  let jpyAggregatorContract = ChainlinkAggregatorContract.bind(jpyAggregator);
  let jpyCurrentPrice = toBigDecimal(jpyAggregatorContract.latestAnswer(), 8);
  trackCurrencyPrice(jpy, event.block.timestamp, jpyCurrentPrice);
  ensureChainlinkCurrencyAggregatorProxy(jpyProxy, jpyAggregator, jpy);

  // USD has not chainlink price source, USD / USD is always 1
  let usd = ensureCurrency('USD');

  let cron = ensureCron();
  cron.primitives = arrayUnique<string>(cron.primitives.concat([weth.id]));
  cron.currencies = arrayUnique<string>(
    cron.currencies.concat([aud.id, btc.id, chf.id, eth.id, eur.id, gbp.id, jpy.id, usd.id]),
  );
  cron.save();

  // It's important that we run cron last.
  triggerCron(event.block.timestamp);
}

// Chainlink uses proxies for their price oracles. Sadly, these proxies do not
// emit events whenever the underlying aggregator changes.
//
// We are monitoring these changes through contract calls as part of cron.

export function handlePrimitiveAdded(event: PrimitiveAdded): void {
  let primitive = ensureAsset(event.params.primitive);
  primitive.type = event.params.rateAsset == 1 ? 'USD' : 'ETH';

  let release = releaseFromPriceFeed(event);
  if (release != null) {
    primitive.releases = arrayUnique<string>(primitive.releases.concat([release.id]));
  }
  primitive.save();

  let primitivePriceFeedAdded = new PrimitiveAddedEvent(genericId(event));
  primitivePriceFeedAdded.primitive = primitive.id;
  primitivePriceFeedAdded.timestamp = event.block.timestamp;
  primitivePriceFeedAdded.transaction = ensureTransaction(event).id;
  primitivePriceFeedAdded.priceFeed = event.params.aggregator.toHex();
  primitivePriceFeedAdded.rateAsset = event.params.rateAsset;
  primitivePriceFeedAdded.save();

  let proxy = event.params.aggregator;
  let aggregator = unwrapAggregator(event.params.aggregator);

  // Whenever a new asset is registered, we need to fetch its current price immediately.
  let contract = ChainlinkAggregatorContract.bind(aggregator);
  let current = toBigDecimal(contract.latestAnswer(), primitive.type === 'USD' ? 8 : 18);

  // NOTE: We incorrectly added a DPI/USD aggregator, we need to do some special treatmet for that one.
  let dpiUsdAggregator = Address.fromString('0xd2a593bf7594ace1fad597adb697b5645d5eddb2');
  if (event.params.aggregator.equals(dpiUsdAggregator)) {
    current = BigDecimal.fromString('0');

    primitive.type = 'ETH';
    primitive.save();
  }

  trackAssetPrice(primitive, event.block.timestamp, current);

  // NOTE: We skip creation of the aggregator data source for DPI/USD.
  if (!event.params.aggregator.equals(dpiUsdAggregator)) {
    // Keep tracking this asset using the registered chainlink aggregator.
    ensureChainlinkAssetAggregatorProxy(proxy, aggregator, primitive);
  }

  let cron = ensureCron();
  cron.primitives = arrayUnique<string>(cron.primitives.concat([primitive.id]));
  if (primitive.type == 'USD') {
    cron.usdQuotedPrimitives = arrayUnique<string>(cron.usdQuotedPrimitives.concat([primitive.id]));
  }
  cron.save();

  // It's important that we run cron last.
  triggerCron(event.block.timestamp);
}

export function handlePrimitiveRemoved(event: PrimitiveRemoved): void {
  let primitive = ensureAsset(event.params.primitive);

  let release = releaseFromPriceFeed(event);
  if (release != null) {
    primitive.releases = arrayDiff<string>(primitive.releases, [release.id]);
  }
  primitive.save();

  let primitivePriceFeedRemoved = new PrimitiveRemovedEvent(genericId(event));
  primitivePriceFeedRemoved.primitive = primitive.id;
  primitivePriceFeedRemoved.timestamp = event.block.timestamp;
  primitivePriceFeedRemoved.transaction = ensureTransaction(event).id;
  primitivePriceFeedRemoved.save();

  let cron = ensureCron();
  cron.primitives = arrayDiff<string>(cron.primitives, [primitive.id]);
  if (primitive.type == 'USD') {
    cron.usdQuotedPrimitives = arrayDiff<string>(cron.usdQuotedPrimitives, [primitive.id]);
  }
  cron.save();

  // It's important that we run cron last.
  triggerCron(event.block.timestamp);
}

export function handlePrimitiveUpdated(event: PrimitiveUpdated): void {
  let primitive = ensureAsset(event.params.primitive);

  let primitiveUpdated = new AggregatorUpdatedEvent(genericId(event));
  primitiveUpdated.timestamp = event.block.timestamp;
  primitiveUpdated.transaction = ensureTransaction(event).id;
  primitiveUpdated.primitive = primitive.id;
  primitiveUpdated.prevAggregator = event.params.prevAggregator.toHex();
  primitiveUpdated.nextAggregator = event.params.nextAggregator.toHex();
  primitiveUpdated.save();

  let proxy = event.params.nextAggregator;
  let aggregator = unwrapAggregator(event.params.nextAggregator);

  // Whenever a new asset is registered, we need to fetch its current price immediately.
  let contract = ChainlinkAggregatorContract.bind(aggregator);
  let current = toBigDecimal(contract.latestAnswer(), primitive.type === 'USD' ? 8 : 18);
  trackAssetPrice(primitive, event.block.timestamp, current);

  // Keep tracking this asset using the registered chainlink aggregator.
  ensureChainlinkAssetAggregatorProxy(proxy, aggregator, primitive);
}
