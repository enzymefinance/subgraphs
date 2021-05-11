import {
  dayCloseTime,
  dayOpenTime,
  hourCloseTime,
  hourOpenTime,
  monthOpenAndClose,
} from '@enzymefinance/subgraph-utils';
import { BigDecimal, BigInt, Entity, store, Value } from '@graphprotocol/graph-ts';
import { Asset, AssetPrice, DailyAssetPriceCandle, HourlyAssetPriceCandle } from '../generated/schema';
import { useAssetPrice } from './AssetPrice';

export function assetPriceCandleId(asset: string, type: string, open: BigInt): string {
  return asset + '/' + type + '/' + open.toString();
}

export function updateHourlyAssetPriceCandle(asset: Asset, price: AssetPrice): HourlyAssetPriceCandle {
  let type = 'Hourly';
  let from = hourOpenTime(price.timestamp);
  let to = hourCloseTime(price.timestamp);
  return maintainAssetPriceCandle(type, from, to, asset, price) as HourlyAssetPriceCandle;
}

export function updateDailyAssetPriceCandle(asset: Asset, price: AssetPrice): DailyAssetPriceCandle {
  let type = 'Daily';
  let from = dayOpenTime(price.timestamp);
  let to = dayCloseTime(price.timestamp);
  return maintainAssetPriceCandle(type, from, to, asset, price) as DailyAssetPriceCandle;
}

export function updateMonthlyAssetPriceCandle(asset: Asset, price: AssetPrice): DailyAssetPriceCandle {
  let type = 'Monthly';
  let openAndClose = monthOpenAndClose(price.timestamp);
  return maintainAssetPriceCandle(type, openAndClose[0], openAndClose[1], asset, price) as DailyAssetPriceCandle;
}

export function maintainAssetPriceCandle(
  type: string,
  from: BigInt,
  to: BigInt,
  asset: Asset,
  price: AssetPrice,
): AssetPriceCandle {
  let id = assetPriceCandleId(price.asset, type, from);
  let candle = AssetPriceCandle.load(type, id) as AssetPriceCandle;
  if (!candle) {
    return createAssetPriceCandle(id, type, asset, price, from, to);
  }

  return updateAssetPriceCandle(type, candle, price);
}

function createAssetPriceCandle(
  id: string,
  type: string,
  asset: Asset,
  price: AssetPrice,
  from: BigInt,
  to: BigInt,
): AssetPriceCandle {
  let previous = asset.price == null || asset.price == price.id ? price : useAssetPrice(asset.price);
  let high = previous.price.gt(price.price) ? previous : price;
  let low = previous.price.lt(price.price) ? previous : price;

  let candle = new AssetPriceCandle(id);
  candle.asset = price.asset;
  candle.group = from.toString();
  candle.from = from;
  candle.to = to;
  candle.open = previous.price;
  candle.openRef = previous.id;
  candle.close = price.price;
  candle.closeRef = price.id;
  candle.high = high.price;
  candle.highRef = high.id;
  candle.low = low.price;
  candle.lowRef = low.id;
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

class AssetPriceCandle extends Entity {
  constructor(id: string) {
    super();
    this.set('id', Value.fromString(id));
  }

  save(type: string): void {
    store.set(type + 'AssetPriceCandle', this.get('id').toString(), this);
  }

  static load(type: string, id: string): AssetPriceCandle | null {
    return store.get(type + 'AssetPriceCandle', id) as AssetPriceCandle | null;
  }

  get id(): string {
    let value = this.get('id');
    return value.toString();
  }

  set id(value: string) {
    this.set('id', Value.fromString(value));
  }

  get group(): string {
    let value = this.get('group');
    return value.toString();
  }

  set group(value: string) {
    this.set('group', Value.fromString(value));
  }

  get asset(): string {
    let value = this.get('asset');
    return value.toString();
  }

  set asset(value: string) {
    this.set('asset', Value.fromString(value));
  }

  get from(): BigInt {
    let value = this.get('from');
    return value.toBigInt();
  }

  set from(value: BigInt) {
    this.set('from', Value.fromBigInt(value));
  }

  get to(): BigInt {
    let value = this.get('to');
    return value.toBigInt();
  }

  set to(value: BigInt) {
    this.set('to', Value.fromBigInt(value));
  }

  get open(): BigDecimal {
    let value = this.get('open');
    return value.toBigDecimal();
  }

  set open(value: BigDecimal) {
    this.set('open', Value.fromBigDecimal(value));
  }

  get openRef(): string {
    let value = this.get('openRef');
    return value.toString();
  }

  set openRef(value: string) {
    this.set('openRef', Value.fromString(value));
  }

  get close(): BigDecimal {
    let value = this.get('close');
    return value.toBigDecimal();
  }

  set close(value: BigDecimal) {
    this.set('close', Value.fromBigDecimal(value));
  }

  get closeRef(): string {
    let value = this.get('closeRef');
    return value.toString();
  }

  set closeRef(value: string) {
    this.set('closeRef', Value.fromString(value));
  }

  get low(): BigDecimal {
    let value = this.get('low');
    return value.toBigDecimal();
  }

  set low(value: BigDecimal) {
    this.set('low', Value.fromBigDecimal(value));
  }

  get lowRef(): string {
    let value = this.get('lowRef');
    return value.toString();
  }

  set lowRef(value: string) {
    this.set('lowRef', Value.fromString(value));
  }

  get high(): BigDecimal {
    let value = this.get('high');
    return value.toBigDecimal();
  }

  set high(value: BigDecimal) {
    this.set('high', Value.fromBigDecimal(value));
  }

  get highRef(): string {
    let value = this.get('highRef');
    return value.toString();
  }

  set highRef(value: string) {
    this.set('highRef', Value.fromString(value));
  }
}
