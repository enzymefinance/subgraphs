import { BigInt } from '@graphprotocol/graph-ts';

export let hour = BigInt.fromI32(3600);
export let day = BigInt.fromI32(86400);
export let week = BigInt.fromI32(604800);

export let hourAdjustment = BigInt.fromI32(0);
export let dayAdjustment = BigInt.fromI32(0);
export let weekAdjustment = BigInt.fromI32(345600);

export function getPreviousStartTime(current: BigInt, type: string): BigInt {
  if (type == 'Hourly') {
    return current.minus(hour);
  } else if (type == 'Daily') {
    return current.minus(day);
  }
  return current.minus(week);
}

export function getHourlyOpenTime(timestamp: BigInt): BigInt {
  let interval = hour;
  let adjustment = hourAdjustment;
  return getOpenTime(timestamp, interval, adjustment);
}

export function getDailyOpenTime(timestamp: BigInt): BigInt {
  let interval = day;
  let adjustment = dayAdjustment;
  return getOpenTime(timestamp, interval, adjustment);
}

export function getWeeklyOpenTime(timestamp: BigInt): BigInt {
  let interval = week;
  let adjustment = weekAdjustment;
  return getOpenTime(timestamp, interval, adjustment);
}

export function getOpenTime(timestamp: BigInt, interval: BigInt, adjustment: BigInt): BigInt {
  let excess = timestamp.minus(adjustment).mod(interval);
  return timestamp.minus(excess);
}
