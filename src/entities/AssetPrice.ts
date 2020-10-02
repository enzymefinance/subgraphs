import { BigInt } from '@graphprotocol/graph-ts';
import { zeroAddress } from '../constants';
import { Asset, AssetPrice } from '../generated/schema';
import { logCritical } from '../utils/logCritical';
import { toBigDecimal } from '../utils/toBigDecimal';
import {
  updateHourlyAssetPriceCandle,
  updateDailyAssetPriceCandle,
  updateWeeklyAssetPriceCandle,
} from './AssetPriceCandle';

export function assetPriceId(asset: Asset, timestamp: BigInt): string {
  return asset.id + '/' + timestamp.toString();
}

export function trackAssetPrice(asset: Asset, current: BigInt, timestamp: BigInt): AssetPrice {
  let id = assetPriceId(asset, timestamp);
  let price = AssetPrice.load(id) as AssetPrice;
  if (price == null) {
    price = new AssetPrice(id);
  }

  price.asset = asset.id;
  price.price = toBigDecimal(current, asset.decimals);
  price.timestamp = timestamp;
  price.save();

  updateAssetPriceReferences(asset, price);

  return price;
}

export function updateAssetPriceReferences(asset: Asset, price: AssetPrice): void {
  let hourly = updateHourlyAssetPriceCandle(price);
  let daily = updateDailyAssetPriceCandle(price);
  let weekly = updateWeeklyAssetPriceCandle(price);

  let current: AssetPrice | null = asset.price == zeroAddress.toHex() ? null : useAssetPrice(asset.price as string);
  if (current == null || current.timestamp.lt(price.timestamp)) {
    asset.price = price.id;
    asset.hourlyCandle = hourly.id;
    asset.dailyCandle = daily.id;
    asset.weeklyCandle = weekly.id;
    asset.save();
  }
}

export function useAssetPrice(id: string): AssetPrice {
  let price = AssetPrice.load(id) as AssetPrice;
  if (price == null) {
    logCritical('Asset price {} does not exist', [id]);
  }

  return price;
}
