import { Address, BigDecimal, ethereum } from '@graphprotocol/graph-ts';
import { dayCloseTime, hourCloseTime, monthCloseTime, ZERO_BD } from '@enzymefinance/subgraph-utils';
import { Asset, AssetPrice, DailyAssetPrice, HourlyAssetPrice, MonthlyAssetPrice } from '../generated/schema';
import { fetchAssetPrice } from '../utils/fetchAssetPrice';

function assetPriceId(asset: Asset, event: ethereum.Event): string {
  return asset.id + '/' + event.block.number.toString();
}

export function updateAssetPrice(asset: Asset, price: BigDecimal, event: ethereum.Event): AssetPrice {
  let id = assetPriceId(asset, event);
  let entity = new AssetPrice(id);
  entity.asset = asset.id;
  entity.timestamp = event.block.timestamp;
  entity.price = price;
  entity.save();

  if (asset.price != entity.id) {
    asset.price = entity.id;
    asset.save();
  }

  let hour = hourCloseTime(event.block.timestamp);
  let hourly = new HourlyAssetPrice(asset.id + '/hourly/' + hour.toString());
  hourly.asset = entity.asset;
  hourly.timestamp = entity.timestamp;
  hourly.price = price;
  hourly.close = hour;
  hourly.save();

  let day = dayCloseTime(event.block.timestamp);
  let daily = new DailyAssetPrice(asset.id + '/daily/' + day.toString());
  daily.asset = entity.asset;
  daily.timestamp = entity.timestamp;
  daily.price = price;
  daily.close = day;
  daily.save();

  let month = monthCloseTime(event.block.timestamp);
  let monthly = new MonthlyAssetPrice(asset.id + '/monthly/' + month.toString());
  monthly.asset = entity.asset;
  monthly.timestamp = entity.timestamp;
  monthly.price = price;
  monthly.close = month;
  monthly.save();

  return entity;
}

export function updateAssetPriceWithValueInterpreter(asset: Asset, interpreter: Address, event: ethereum.Event): void {
  let value = fetchAssetPrice(asset, interpreter);
  updateAssetPrice(asset, value, event);
}

export function getLatestAssetPrice(asset: Asset): AssetPrice | null {
  if (asset.price == '') {
    return null;
  }

  return AssetPrice.load(asset.price);
}
