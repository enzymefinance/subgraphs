import { BigDecimal, BigInt } from '@graphprotocol/graph-ts';
import { Asset, AssetPrice } from '../generated/schema';
import { logCritical } from '../utils/logCritical';
import {
  updateHourlyAssetPriceCandle,
  updateDailyAssetPriceCandle,
  updateWeeklyAssetPriceCandle,
} from './AssetPriceCandle';

export function assetPriceId(asset: Asset, timestamp: BigInt): string {
  return asset.id + '/' + timestamp.toString();
}

export function useAssetPrice(id: string): AssetPrice {
  let price = AssetPrice.load(id) as AssetPrice;
  if (price == null) {
    logCritical('Asset price {} does not exist', [id]);
  }

  return price;
}

export function createAssetPrice(asset: Asset, current: BigDecimal, timestamp: BigInt): AssetPrice {
  let id = assetPriceId(asset, timestamp);
  let price = new AssetPrice(id);
  price.asset = asset.id;
  price.price = current;
  price.timestamp = timestamp;
  price.save();

  return price;
}

export function ensureAssetPrice(asset: Asset, current: BigDecimal, timestamp: BigInt): AssetPrice {
  let id = assetPriceId(asset, timestamp);
  let price = AssetPrice.load(id) as AssetPrice;

  if (price != null && !current.equals(price.price)) {
    price.price = current;
    price.save();
  }

  if (price == null) {
    price = createAssetPrice(asset, current, timestamp);
  }

  return price;
}

export function trackAssetPrice(asset: Asset, current: BigDecimal, timestamp: BigInt): AssetPrice {
  let price = ensureAssetPrice(asset, current, timestamp);
  let hourly = updateHourlyAssetPriceCandle(price, timestamp);
  let daily = updateDailyAssetPriceCandle(price, timestamp);
  let weekly = updateWeeklyAssetPriceCandle(price, timestamp);

  asset.price = price.id;
  asset.hourly = hourly.id;
  asset.daily = daily.id;
  asset.weekly = weekly.id;
  asset.save();

  return price;
}
