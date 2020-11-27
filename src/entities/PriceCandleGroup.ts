import { BigInt } from '@graphprotocol/graph-ts';
import { DailyPriceCandleGroup, HourlyPriceCandleGroup, MonthlyPriceCandleGroup } from '../generated/schema';
import { getDayCloseTime, getHourCloseTime } from '../utils/timeHelpers';
import { PriceCandleGroup } from './PriceCandleGroupEntity';

export function ensureHourlyPriceCandleGroup(from: BigInt): HourlyPriceCandleGroup {
  let to = getHourCloseTime(from);
  return ensurePriceCandleGroup('Hourly', from, to) as HourlyPriceCandleGroup;
}

export function ensureDailyPriceCandleGroup(from: BigInt): DailyPriceCandleGroup {
  let to = getDayCloseTime(from);
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
