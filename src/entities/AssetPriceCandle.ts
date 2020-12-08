import { BigInt } from '@graphprotocol/graph-ts';
import { Asset, AssetPrice, DailyAssetPriceCandle, HourlyAssetPriceCandle } from '../generated/schema';
import {
  getDayCloseTime,
  getDayOpenTime,
  getHourCloseTime,
  getHourOpenTime,
  getMonthOpenAndClose,
} from '../utils/timeHelpers';
import { useAssetPrice } from './AssetPrice';
import { AssetPriceCandle } from './AssetPriceCandleEntity';

export function assetPriceCandleId(assetId: string, type: string, open: BigInt): string {
  return assetId + '/' + type + '/' + open.toString();
}

export function updateHourlyAssetPriceCandle(asset: Asset, current: AssetPrice): HourlyAssetPriceCandle {
  let type = 'Hourly';
  let from = getHourOpenTime(current.timestamp);
  let to = getHourCloseTime(current.timestamp);
  return maintainAssetPriceCandle(type, from, to, asset, current) as HourlyAssetPriceCandle;
}

export function updateDailyAssetPriceCandle(asset: Asset, current: AssetPrice): DailyAssetPriceCandle {
  let type = 'Daily';
  let from = getDayOpenTime(current.timestamp);
  let to = getDayCloseTime(current.timestamp);
  return maintainAssetPriceCandle(type, from, to, asset, current) as DailyAssetPriceCandle;
}

export function updateMonthlyAssetPriceCandle(asset: Asset, current: AssetPrice): DailyAssetPriceCandle {
  let type = 'Monthly';
  let openAndClose = getMonthOpenAndClose(current.timestamp);
  return maintainAssetPriceCandle(type, openAndClose[0], openAndClose[1], asset, current) as DailyAssetPriceCandle;
}

export function maintainAssetPriceCandle(
  type: string,
  from: BigInt,
  to: BigInt,
  asset: Asset,
  current: AssetPrice,
): AssetPriceCandle {
  let id = assetPriceCandleId(current.asset, type, from);
  let candle = AssetPriceCandle.load(type, id) as AssetPriceCandle;
  if (!candle) {
    return createAssetPriceCandle(id, type, asset, current, from, to);
  }

  return updateAssetPriceCandle(type, candle, current);
}

function createAssetPriceCandle(
  id: string,
  type: string,
  asset: Asset,
  current: AssetPrice,
  from: BigInt,
  to: BigInt,
): AssetPriceCandle {
  let previous = asset.price == null || asset.price == current.id ? current : useAssetPrice(asset.price);
  let high = previous.price.gt(current.price) ? previous : current;
  let low = previous.price.lt(current.price) ? previous : current;

  let candle = new AssetPriceCandle(id);
  candle.asset = current.asset;
  candle.group = from.toString();
  candle.from = from;
  candle.to = to;
  candle.open = previous.price;
  candle.openRef = previous.id;
  candle.close = current.price;
  candle.closeRef = current.id;
  candle.high = high.price;
  candle.highRef = high.id;
  candle.low = low.price;
  candle.lowRef = low.id;
  candle.save(type);

  return candle;
}

function updateAssetPriceCandle(type: string, candle: AssetPriceCandle, current: AssetPrice): AssetPriceCandle {
  if (candle.closeRef == current.id) {
    return candle;
  }

  candle.close = current.price;
  candle.closeRef = current.id;

  if (current.price.lt(candle.low)) {
    candle.low = current.price;
    candle.lowRef = current.id;
  }

  if (current.price.gt(candle.high)) {
    candle.high = current.price;
    candle.highRef = current.id;
  }

  candle.save(type);

  return candle;
}
