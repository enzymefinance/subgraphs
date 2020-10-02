import { BigDecimal, BigInt } from '@graphprotocol/graph-ts';
import { DailyAssetPriceCandle, HourlyAssetPriceCandle, AssetPrice, WeeklyAssetPriceCandle } from '../generated/schema';
import { arrayUnique } from '../utils/arrayUnique';
import { day, dayAdjustment, hour, hourAdjustment, week, weekAdjustment } from '../utils/timeHelpers';
import { calculateAverage, calculateMedian } from '../utils/basicMath';
import { AssetPriceCandle } from './AssetPriceEntity';
import { useAssetPrice } from './AssetPrice';

export function assetPriceCandleId(assetId: string, type: string, open: BigInt): string {
  return assetId + '/' + type + '/' + open.toString();
}

export function updateHourlyAssetPriceCandle(price: AssetPrice): HourlyAssetPriceCandle {
  let interval = hour;
  let adjustment = hourAdjustment;
  return updateAssetPriceCandle('Hourly', interval, adjustment, price) as HourlyAssetPriceCandle;
}

export function updateDailyAssetPriceCandle(price: AssetPrice): DailyAssetPriceCandle {
  let interval = day;
  let adjustment = dayAdjustment;
  return updateAssetPriceCandle('Daily', interval, adjustment, price) as DailyAssetPriceCandle;
}

export function updateWeeklyAssetPriceCandle(price: AssetPrice): WeeklyAssetPriceCandle {
  let interval = week;
  let adjustment = weekAdjustment;
  return updateAssetPriceCandle('Weekly', interval, adjustment, price) as WeeklyAssetPriceCandle;
}

// export function createMissingHourlyAssetPriceCandles(feed: AssetPriceFeed, latest: Candle): void {
//   let previous = feed.latestHourlyAssetPriceCandle;
//   let interval = hour;
//   createMissingCandles('Hourly', feed, latest, previous, interval);
// }

// export function createMissingDailyCandles(feed: AssetPriceFeed, latest: Candle): void {
//   let previous = feed.latestDailyCandle;
//   let interval = day;
//   createMissingCandles('Daily', feed, latest, previous, interval);
// }

// export function createMissingWeeklyAssetPriceCandles(feed: AssetPriceFeed, latest: Candle): void {
//   let previous = feed.latestDailyCandle;
//   let interval = week;
//   createMissingCandles('Weekly', feed, latest, previous, interval);
// }

// export function createMissingCandles(
//   type: string,
//   feed: AssetPriceFeed,
//   latest: Candle,
//   previd: string,
//   interval: BigInt,
// ): void {
//   let previous = Candle.load(type, previd);
//   if (!previous) {
//     return;
//   }

//   let open = previous.openTimestamp;
//   let prices = previous.includedPrices;
//   let last = prices[prices.length - 1];
//   let price = AssetPrice.load(last) as AssetPrice;

//   while (price != null && open.plus(interval).lt(latest.openTimestamp)) {
//     open = open.plus(interval);

//     let id = candleId(feed.id, type, open);
//     createCandle(id, type, price, open, open.plus(interval));
//   }
// }

export function createAssetPriceCandle(
  id: string,
  type: string,
  price: AssetPrice,
  open: BigInt,
  close: BigInt,
): AssetPriceCandle {
  let candle = new AssetPriceCandle(id);
  candle.asset = price.asset;
  candle.group = open.toString();
  candle.openTimestamp = open;
  candle.closeTimestamp = close;
  candle.averagePrice = price.price;
  candle.medianPrice = price.price;
  candle.openPrice = price.price;
  candle.closePrice = price.price;
  candle.highPrice = price.price;
  candle.lowPrice = price.price;
  candle.includedPrices = [price.id];
  candle.save(type);

  return candle;
}

export function updateAssetPriceCandle(
  type: string,
  interval: BigInt,
  adjustment: BigInt,
  price: AssetPrice,
): AssetPriceCandle {
  let excess = price.timestamp.minus(adjustment).mod(interval);
  let open = price.timestamp.minus(excess);
  let close = open.plus(interval);

  let id = assetPriceCandleId(price.asset, type, open);
  let candle = AssetPriceCandle.load(type, id) as AssetPriceCandle;

  if (!candle) {
    candle = createAssetPriceCandle(id, type, price, open, close);
  } else {
    candle.includedPrices = arrayUnique<string>(candle.includedPrices.concat([price.id]));
    let prices = candle.includedPrices.map<BigDecimal>((id) => useAssetPrice(id).price);

    candle.averagePrice = calculateAverage(prices);
    candle.averagePrice = calculateMedian(prices);
    candle.closePrice = price.price;

    if (price.price.lt(candle.lowPrice)) {
      candle.lowPrice = price.price;
    }

    if (price.price.gt(candle.highPrice)) {
      candle.highPrice = price.price;
    }

    candle.save(type);
  }

  return candle;
}
