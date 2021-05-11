import { logCritical } from '@enzymefinance/subgraph-utils';
import { BigDecimal, BigInt } from '@graphprotocol/graph-ts';
import { Asset, AssetPrice } from '../generated/schema';
import {
  updateDailyAssetPriceCandle,
  updateHourlyAssetPriceCandle,
  updateMonthlyAssetPriceCandle,
} from './AssetPriceCandle';

function assetPriceId(asset: Asset, timestamp: BigInt): string {
  return asset.id + '/' + timestamp.toString();
}

function createAssetPrice(asset: Asset, price: BigDecimal, timestamp: BigInt): AssetPrice {
  let id = assetPriceId(asset, timestamp);
  let entity = new AssetPrice(id);
  entity.asset = asset.id;
  entity.price = price;
  entity.timestamp = timestamp;
  entity.save();

  return entity;
}

export function useAssetPrice(id: string): AssetPrice {
  let price = AssetPrice.load(id) as AssetPrice;
  if (price == null) {
    logCritical('Asset price {} does not exist', [id]);
  }

  return price;
}

function ensureAssetPrice(asset: Asset, price: BigDecimal, timestamp: BigInt): AssetPrice {
  let id = assetPriceId(asset, timestamp);
  let entity = AssetPrice.load(id) as AssetPrice;

  if (entity != null && !price.equals(entity.price)) {
    entity.price = price;
    entity.save();
  }

  if (entity == null) {
    entity = createAssetPrice(asset, price, timestamp);
  }

  return price;
}

export function trackAssetPrice(asset: Asset, price: BigDecimal, timestamp: BigInt): AssetPrice {
  let current = ensureAssetPrice(asset, price, timestamp);
  // Skip updates within the same block.
  if (current.id == asset.price) {
    return current;
  }

  let hourly = updateHourlyAssetPriceCandle(asset, current);
  let daily = updateDailyAssetPriceCandle(asset, current);
  let monthly = updateMonthlyAssetPriceCandle(asset, current);

  // NOTE: It's important that we update the price references AFTER the candles have been updated.
  // Otherwise, we can't carry over the previous value to the new candles.
  asset.price = current.id;
  asset.hourly = hourly.id;
  asset.daily = daily.id;
  asset.monthly = monthly.id;
  asset.save();

  return current;
}
