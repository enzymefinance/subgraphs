import { dayCloseTime, hourCloseTime } from '@enzymefinance/subgraph-utils';
import { BigInt, Entity, store, Value } from '@graphprotocol/graph-ts';
import { DailyPriceCandleGroup, HourlyPriceCandleGroup, MonthlyPriceCandleGroup } from '../generated/schema';

export function ensureHourlyPriceCandleGroup(from: BigInt): HourlyPriceCandleGroup {
  let to = hourCloseTime(from);
  return ensurePriceCandleGroup('Hourly', from, to) as HourlyPriceCandleGroup;
}

export function ensureDailyPriceCandleGroup(from: BigInt): DailyPriceCandleGroup {
  let to = dayCloseTime(from);
  return ensurePriceCandleGroup('Daily', from, to) as DailyPriceCandleGroup;
}

export function ensureMonthlyPriceCandleGroup(from: BigInt, to: BigInt): MonthlyPriceCandleGroup {
  return ensurePriceCandleGroup('Monthly', from, to) as MonthlyPriceCandleGroup;
}

function ensurePriceCandleGroup(type: string, from: BigInt, to: BigInt): PriceCandleGroup {
  let id = from.toString();
  let group = PriceCandleGroup.load(type, id) as PriceCandleGroup;
  if (group != null) {
    return group;
  }

  group = new PriceCandleGroup(id);
  group.from = from;
  group.to = to;
  group.save(type);

  return group;
}

class PriceCandleGroup extends Entity {
  constructor(id: string) {
    super();
    this.set('id', Value.fromString(id));
  }

  save(type: string): void {
    store.set(type + 'PriceCandleGroup', this.get('id').toString(), this);
  }

  static load(type: string, id: string): PriceCandleGroup | null {
    return store.get(type + 'PriceCandleGroup', id) as PriceCandleGroup | null;
  }

  get id(): string {
    let value = this.get('id');
    return value.toString();
  }

  set id(value: string) {
    this.set('id', Value.fromString(value));
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
}
