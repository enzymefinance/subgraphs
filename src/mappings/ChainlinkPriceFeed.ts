import { Address, BigDecimal } from '@graphprotocol/graph-ts';
import {
  audChainlinkAggregator,
  btcChainlinkAggregator,
  chfChainlinkAggregator,
  eurChainlinkAggregator,
  fundDeployerAddress,
  gbpChainlinkAggregator,
  jpyChainlinkAggregator,
  wethTokenAddress,
} from '../addresses';
import { zeroAddress } from '../constants';
import { ensureAsset } from '../entities/Asset';
import { trackAssetPrice } from '../entities/AssetPrice';
import {
  disableChainlinkAssetAggregator,
  disableChainlinkEthUsdAggregator,
  enableChainlinkAssetAggregator,
  enableChainlinkCurrencyAggregator,
  enableChainlinkEthUsdAggregator,
} from '../entities/ChainlinkAggregator';
import { ensureCurrency } from '../entities/Currency';
import { trackCurrencyPrice } from '../entities/CurrencyPrice';
import { ensureNetwork } from '../entities/Network';
import { ensureRelease } from '../entities/Release';
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

function unwrapAggregator(address: Address): Address {
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
  // NOTE: This is the first event on mainnet.
  ensureNetwork(event);

  let network = ensureNetwork(event);

  // Set up release (each new fund deployer is a release)
  let release = ensureRelease(fundDeployerAddress.toHex(), event);

  network.currentRelease = release.id;
  network.save();

  let ethUsdAggregatorSet = new EthUsdAggregatorSetEvent(genericId(event));
  ethUsdAggregatorSet.timestamp = event.block.timestamp;
  ethUsdAggregatorSet.transaction = ensureTransaction(event).id;
  ethUsdAggregatorSet.prevEthUsdAggregator = event.params.prevEthUsdAggregator.toHex();
  ethUsdAggregatorSet.nextEthUsdAggregator = event.params.nextEthUsdAggregator.toHex();
  ethUsdAggregatorSet.save();

  if (!event.params.prevEthUsdAggregator.equals(zeroAddress)) {
    let aggregator = unwrapAggregator(event.params.prevEthUsdAggregator);
    disableChainlinkEthUsdAggregator(aggregator);
  }

  let ethAggregator = unwrapAggregator(event.params.nextEthUsdAggregator);
  let eth = ensureCurrency('ETH');
  let ethAggregatorContract = ChainlinkAggregatorContract.bind(ethAggregator);
  let ethCurrentPrice = toBigDecimal(ethAggregatorContract.latestAnswer(), 8);
  trackCurrencyPrice(eth, event.block.timestamp, ethCurrentPrice);
  enableChainlinkEthUsdAggregator(ethAggregator, eth);

  // Create WETH manually
  let weth = ensureAsset(wethTokenAddress);
  if (weth.type != 'ETH') {
    weth.type = 'ETH';
    weth.save();
  }

  // Aggregators for currencies
  let audAggregator = unwrapAggregator(audChainlinkAggregator);
  let aud = ensureCurrency('AUD');
  let audAggregatorContract = ChainlinkAggregatorContract.bind(audAggregator);
  let audCurrentPrice = toBigDecimal(audAggregatorContract.latestAnswer(), 8);
  trackCurrencyPrice(aud, event.block.timestamp, audCurrentPrice);
  enableChainlinkCurrencyAggregator(audAggregator, aud);

  let btcAggregator = unwrapAggregator(btcChainlinkAggregator);
  let btc = ensureCurrency('BTC');
  let btcAggregatorContract = ChainlinkAggregatorContract.bind(btcAggregator);
  let btcCurrentPrice = toBigDecimal(btcAggregatorContract.latestAnswer(), 8);
  trackCurrencyPrice(btc, event.block.timestamp, btcCurrentPrice);
  enableChainlinkCurrencyAggregator(btcAggregator, btc);

  let chfAggregator = unwrapAggregator(chfChainlinkAggregator);
  let chf = ensureCurrency('CHF');
  let chfAggregatorContract = ChainlinkAggregatorContract.bind(chfAggregator);
  let chfCurrentPrice = toBigDecimal(chfAggregatorContract.latestAnswer(), 8);
  trackCurrencyPrice(chf, event.block.timestamp, chfCurrentPrice);
  enableChainlinkCurrencyAggregator(chfAggregator, chf);

  let eurAggregator = unwrapAggregator(eurChainlinkAggregator);
  let eur = ensureCurrency('EUR');
  let eurAggregatorContract = ChainlinkAggregatorContract.bind(eurAggregator);
  let eurCurrentPrice = toBigDecimal(eurAggregatorContract.latestAnswer(), 8);
  trackCurrencyPrice(eur, event.block.timestamp, eurCurrentPrice);
  enableChainlinkCurrencyAggregator(eurAggregator, eur);

  let gbpAggregator = unwrapAggregator(gbpChainlinkAggregator);
  let gbp = ensureCurrency('GBP');
  let gbpAggregatorContract = ChainlinkAggregatorContract.bind(gbpAggregator);
  let gbpCurrentPrice = toBigDecimal(gbpAggregatorContract.latestAnswer(), 8);
  trackCurrencyPrice(gbp, event.block.timestamp, gbpCurrentPrice);
  enableChainlinkCurrencyAggregator(gbpAggregator, gbp);

  let jpyAggregator = unwrapAggregator(jpyChainlinkAggregator);
  let jpy = ensureCurrency('JPY');
  let jpyAggregatorContract = ChainlinkAggregatorContract.bind(jpyAggregator);
  let jpyCurrentPrice = toBigDecimal(jpyAggregatorContract.latestAnswer(), 8);
  trackCurrencyPrice(jpy, event.block.timestamp, jpyCurrentPrice);
  enableChainlinkCurrencyAggregator(jpyAggregator, jpy);

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

export function handlePrimitiveAdded(event: PrimitiveAdded): void {
  let primitive = ensureAsset(event.params.primitive);
  primitive.removed = false;
  primitive.type = event.params.rateAsset == 1 ? 'USD' : 'ETH';
  primitive.save();

  let primitivePriceFeedAdded = new PrimitiveAddedEvent(genericId(event));
  primitivePriceFeedAdded.primitive = primitive.id;
  primitivePriceFeedAdded.timestamp = event.block.timestamp;
  primitivePriceFeedAdded.transaction = ensureTransaction(event).id;
  primitivePriceFeedAdded.priceFeed = event.params.aggregator.toHex();
  primitivePriceFeedAdded.rateAsset = event.params.rateAsset;
  primitivePriceFeedAdded.save();

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

<<<<<<< HEAD
  // Keep tracking this asset using the registered chainlink aggregator.
  enableChainlinkAssetAggregator(aggregator, primitive);
=======
  // NOTE: We skip creation of the aggregator data source for DPI/USD.
  if (!event.params.aggregator.equals(dpiUsdAggregator)) {
    // Keep tracking this asset using the registered chainlink aggregator.
    ensureChainlinkAssetAggregatorProxy(proxy, aggregator, primitive);
  }
>>>>>>> main

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
  primitive.removed = true;
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

  if (!event.params.prevAggregator.equals(zeroAddress)) {
    let aggregator = unwrapAggregator(event.params.prevAggregator);
    disableChainlinkAssetAggregator(aggregator, primitive);
  }

  let aggregator = unwrapAggregator(event.params.nextAggregator);

  // Whenever a new asset is registered, we need to fetch its current price immediately.
  let contract = ChainlinkAggregatorContract.bind(aggregator);
  let current = toBigDecimal(contract.latestAnswer(), primitive.type === 'USD' ? 8 : 18);
  trackAssetPrice(primitive, event.block.timestamp, current);

  // Keep tracking this asset using the registered chainlink aggregator.
  enableChainlinkAssetAggregator(aggregator, primitive);
}
