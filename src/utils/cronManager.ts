import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts';
import { wethTokenAddress } from '../addresses';
import { ensureAsset } from '../entities/Asset';
import { fetchAssetPrice, trackAssetPrice, useAssetPrice } from '../entities/AssetPrice';
import {
  ensureChainlinkAssetAggregatorProxy,
  ensureChainlinkCurrencyAggregatorProxy,
  ensureChainlinkEthUsdAggregatorProxy,
  useChainlinkAggregatorProxy,
} from '../entities/ChainlinkAggregatorProxy';
import { ensureCurrency } from '../entities/Currency';
import { trackCurrencyPrice, useCurrencyPrice } from '../entities/CurrencyPrice';
import {
  ensureDailyPriceCandleGroup,
  ensureHourlyPriceCandleGroup,
  ensureMonthlyPriceCandleGroup,
} from '../entities/PriceCandleGroup';
import { Asset, ChainlinkAggregatorProxy, Cron } from '../generated/schema';
import { unwrapAggregator } from '../mappings/ChainlinkPriceFeed';
import { arrayUnique } from './arrayUnique';
import { logCritical } from './logCritical';
import { getDayOpenTime, getHourOpenTime, getMonthOpenAndClose } from './timeHelpers';

export function ensureCron(): Cron {
  let cron = Cron.load('SINGLETON') as Cron;
  if (cron == null) {
    cron = new Cron('SINGLETON');
    cron.cron = BigInt.fromI32(-1);
    cron.primitives = new Array<string>();
    cron.derivatives = new Array<string>();
    cron.usdQuotedPrimitives = new Array<string>();
    cron.currencies = new Array<string>();
    cron.chainlinkAggregatorProxies = new Array<string>();
    cron.save();
  }

  return cron;
}

export function triggerCron(timestamp: BigInt): void {
  let cron = ensureCron();
  if (cron.cron.ge(timestamp)) {
    // We've been here before. No need to run the cron job.
    return;
  }

  let previousWindow = getHourOpenTime(cron.cron);
  let currentWindow = getHourOpenTime(timestamp);
  let previousDay = getDayOpenTime(cron.cron);
  let currentDay = getDayOpenTime(timestamp);

  // Update once per hour.
  if (!currentWindow.gt(previousWindow)) {
    return;
  }

  cronWeth(timestamp);
  cronUsd(timestamp);
  cronDependentPrices(cron.usdQuotedPrimitives, timestamp);
  cronDependentPrices(cron.derivatives, timestamp);
  cronCandles(cron, timestamp);

  cron.cron = timestamp;
  cron.save();

  // Update once day.
  if (!currentDay.gt(previousDay)) {
    return;
  }

  cronChainlinkAggregatorProxies(cron.chainlinkAggregatorProxies);
}

function cronWeth(timestamp: BigInt): void {
  let asset = ensureAsset(wethTokenAddress);
  let current = BigDecimal.fromString('1');
  trackAssetPrice(asset, timestamp, current);
}

function cronUsd(timestamp: BigInt): void {
  let currency = ensureCurrency('USD');
  let current = BigDecimal.fromString('1');
  trackCurrencyPrice(currency, timestamp, current);
}

function cronDependentPrices(assetIds: string[], timestamp: BigInt): void {
  let assets = assetIds.map<Asset>((assetId) => ensureAsset(Address.fromString(assetId)));
  for (let i: i32 = 0; i < assets.length; i++) {
    let asset = assets[i];
    let current = fetchAssetPrice(asset);
    trackAssetPrice(asset, timestamp, current);
  }
}

function cronCandles(cron: Cron, timestamp: BigInt): void {
  let currentHour = getHourOpenTime(timestamp);

  ensureHourlyPriceCandleGroup(currentHour);

  let currentDay = getDayOpenTime(timestamp);
  if (currentDay.gt(getDayOpenTime(cron.cron))) {
    ensureDailyPriceCandleGroup(currentDay);
  }

  let currentMonthStartEnd = getMonthOpenAndClose(timestamp);
  let currentCronStartEnd = getMonthOpenAndClose(cron.cron);
  if (currentMonthStartEnd[0].gt(currentCronStartEnd[0])) {
    ensureMonthlyPriceCandleGroup(currentMonthStartEnd[0], currentMonthStartEnd[1]);
  }

  let assetIds = arrayUnique<string>(cron.primitives.concat(cron.derivatives));
  for (let i: i32 = 0; i < assetIds.length; i++) {
    let asset = ensureAsset(Address.fromString(assetIds[i]));
    if (asset.price == null) {
      logCritical('Missing price for asset {}', [asset.id]);
    }

    let price = useAssetPrice(asset.price as string);
    trackAssetPrice(asset, timestamp, price.price);
  }

  let currencyIds = cron.currencies;
  for (let i: i32 = 0; i < currencyIds.length; i++) {
    let currency = ensureCurrency(currencyIds[i]);
    if (currency.price == null) {
      logCritical('Missing price for currency {}', [currency.id]);
    }

    let price = useCurrencyPrice(currency.price as string);
    trackCurrencyPrice(currency, timestamp, price.price);
  }
}

function cronChainlinkAggregatorProxies(proxyIds: string[]): void {
  let proxies = proxyIds.map<ChainlinkAggregatorProxy>((id) => useChainlinkAggregatorProxy(id));
  for (let i: i32 = 0; i < proxyIds.length; i++) {
    let proxy = proxies[i];

    let newAggregator = unwrapAggregator(Address.fromString(proxy.id));

    if (proxy.aggregator != newAggregator.toHex()) {
      let proxyAddress = Address.fromString(proxy.id);

      if (proxy.type == 'ASSET') {
        let asset = ensureAsset(Address.fromString(proxy.asset as string));
        ensureChainlinkAssetAggregatorProxy(proxyAddress, newAggregator, asset);
      } else if (proxy.type == 'ETHUSD') {
        let eth = ensureCurrency('ETH');
        ensureChainlinkEthUsdAggregatorProxy(proxyAddress, newAggregator, eth);
      } else if (proxy.type == 'CURRENCY') {
        let currency = ensureCurrency(proxy.currency as string);
        ensureChainlinkCurrencyAggregatorProxy(proxyAddress, newAggregator, currency);
      }
    }
  }
}
