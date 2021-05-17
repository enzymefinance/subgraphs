import { dayTimeRange, hourTimeRange, monthTimeRange } from '@enzymefinance/subgraph-utils';
import { BigInt, Entity, store, Value } from '@graphprotocol/graph-ts';
import { Asset, DailyPriceWindow, HourlyPriceWindow, MonthlyPriceWindow, Price } from '../../generated/schema';

export function updateHourlyPriceWindow(asset: Asset, price: Price): HourlyPriceWindow {
  let range = hourTimeRange(price.timestamp);
  return updatePriceWindow('HOURLY', range.from, range.to, asset, price) as HourlyPriceWindow;
}

export function updateDailyPriceWindow(asset: Asset, price: Price): DailyPriceWindow {
  let range = dayTimeRange(price.timestamp);
  return updatePriceWindow('DAILY', range.from, range.to, asset, price) as DailyPriceWindow;
}

export function updateMonthlyPriceWindow(asset: Asset, price: Price): MonthlyPriceWindow {
  let range = monthTimeRange(price.timestamp);
  return updatePriceWindow('MONTHLY', range.from, range.to, asset, price) as MonthlyPriceWindow;
}

function priceWindowId(type: string, asset: string, open: BigInt): string {
  return type + '/' + asset + '/' + open.toString();
}

function updatePriceWindow(type: string, from: BigInt, to: BigInt, asset: Asset, price: Price): PriceWindow {
  let id = priceWindowId(type, price.asset, from);
  let window = PriceWindow.load(id) as PriceWindow;

  if (window == null) {
    let previous = asset.price == '' ? price.id : asset.price;
    window = new PriceWindow(id, type);
    window.asset = price.asset;
    window.from = from;
    window.to = to;
    window.open = previous;
    window.close = price.id;
    window.save();
  }

  if (window.close != price.id) {
    window.close = price.id;
    window.save();
  }

  return window;
}

export class PriceWindow extends Entity {
  constructor(id: string, type: string) {
    super();
    this.set('id', Value.fromString(id));
    this.set('type', Value.fromString(type));
  }

  save(): void {
    let entity = '';
    let type = this.type;

    if (type == 'HOURLY') {
      entity = 'HourlyPriceWindow';
    } else if (type == 'DAILY') {
      entity = 'DailyPriceWindow';
    } else if (type == 'MONTHLY') {
      entity = 'MonthlyPriceWindow';
    } else {
      return;
    }

    store.set(entity, this.id, this);
  }

  static entity(id: string): string | null {
    let type = id.split('/', 1)[0];

    if (type == 'HOURLY') {
      return 'HourlyPriceWindow';
    }

    if (type == 'DAILY') {
      return 'DailyPriceWindow';
    }

    if (type == 'MONTHLY') {
      return 'MonthlyPriceWindow';
    }

    return null;
  }

  static remove(id: string): void {
    let entity = this.entity(id);
    if (entity == null) {
      return;
    }

    store.remove(entity, id);
  }

  static load(id: string): PriceWindow | null {
    let entity = this.entity(id);
    if (entity == null) {
      return null;
    }

    return store.get(entity, id) as PriceWindow | null;
  }

  get id(): string {
    let value = this.get('id') as Value;
    return value.toString();
  }

  set id(value: string) {
    this.set('id', Value.fromString(value));
  }

  get type(): string {
    let value = this.get('type') as Value;
    return value.toString();
  }

  set type(value: string) {
    this.set('type', Value.fromString(value));
  }

  get asset(): string {
    let value = this.get('asset') as Value;
    return value.toString();
  }

  set asset(value: string) {
    this.set('asset', Value.fromString(value));
  }

  get from(): BigInt {
    let value = this.get('from') as Value;
    return value.toBigInt();
  }

  set from(value: BigInt) {
    this.set('from', Value.fromBigInt(value));
  }

  get to(): BigInt {
    let value = this.get('to') as Value;
    return value.toBigInt();
  }

  set to(value: BigInt) {
    this.set('to', Value.fromBigInt(value));
  }

  get open(): string {
    let value = this.get('open') as Value;
    return value.toString();
  }

  set open(value: string) {
    this.set('open', Value.fromString(value));
  }

  get close(): string {
    let value = this.get('close') as Value;
    return value.toString();
  }

  set close(value: string) {
    this.set('close', Value.fromString(value));
  }
}
