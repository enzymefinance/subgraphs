import { BigInt } from '@graphprotocol/graph-ts';
import { DailyAssetPriceCandle, HourlyAssetPriceCandle, AssetPrice, WeeklyAssetPriceCandle } from '../generated/schema';
import { day, dayAdjustment, hour, hourAdjustment, week, weekAdjustment } from '../utils/timeHelpers';
import { AssetPriceCandle } from './AssetPriceEntity';

export function assetPriceCandleId(assetId: string, type: string, open: BigInt): string {
  return assetId + '/' + type + '/' + open.toString();
}

export function updateHourlyAssetPriceCandle(price: AssetPrice, timestamp: BigInt): HourlyAssetPriceCandle {
  let interval = hour;
  let adjustment = hourAdjustment;
  return maintainAssetPriceCandle('Hourly', interval, adjustment, timestamp, price) as HourlyAssetPriceCandle;
}

export function updateDailyAssetPriceCandle(price: AssetPrice, timestamp: BigInt): DailyAssetPriceCandle {
  let interval = day;
  let adjustment = dayAdjustment;
  return maintainAssetPriceCandle('Daily', interval, adjustment, timestamp, price) as DailyAssetPriceCandle;
}

export function updateWeeklyAssetPriceCandle(price: AssetPrice, timestamp: BigInt): WeeklyAssetPriceCandle {
  let interval = week;
  let adjustment = weekAdjustment;
  return maintainAssetPriceCandle('Weekly', interval, adjustment, timestamp, price) as WeeklyAssetPriceCandle;
}

export function maintainAssetPriceCandle(
  type: string,
  interval: BigInt,
  adjustment: BigInt,
  timestamp: BigInt,
  price: AssetPrice,
): AssetPriceCandle {
  let excess = timestamp.minus(adjustment).mod(interval);
  let from = timestamp.minus(excess);
  let to = from.plus(interval);

  let id = assetPriceCandleId(price.asset, type, from);
  let candle = AssetPriceCandle.load(type, id) as AssetPriceCandle;
  if (!candle) {
    return createAssetPriceCandle(id, type, price, from, to);
  }

  return updateAssetPriceCandle(type, candle, price);
}

function createAssetPriceCandle(
  id: string,
  type: string,
  price: AssetPrice,
  from: BigInt,
  to: BigInt,
): AssetPriceCandle {
  let candle = new AssetPriceCandle(id);
  candle.asset = price.asset;
  candle.group = from.toString();
  candle.from = from;
  candle.to = to;
  candle.open = price.price;
  candle.openRef = price.id;
  candle.close = price.price;
  candle.closeRef = price.id;
  candle.high = price.price;
  candle.highRef = price.id;
  candle.low = price.price;
  candle.lowRef = price.id;
  candle.save(type);

  return candle;
}

function updateAssetPriceCandle(type: string, candle: AssetPriceCandle, price: AssetPrice): AssetPriceCandle {
  if (candle.closeRef == price.id) {
    return candle;
  }

  candle.close = price.price;
  candle.closeRef = price.id;

  if (price.price.lt(candle.low)) {
    candle.low = price.price;
    candle.lowRef = price.id;
  }

  if (price.price.gt(candle.high)) {
    candle.high = price.price;
    candle.highRef = price.id;
  }

  candle.save(type);

  return candle;
}
