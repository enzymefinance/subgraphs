import { BigInt } from '@graphprotocol/graph-ts';

export let minute = BigInt.fromI32(60);
export let hour = BigInt.fromI32(3600);
export let day = BigInt.fromI32(86400);
export let week = BigInt.fromI32(604800);

export let minuteAdjustment = BigInt.fromI32(0);
export let hourAdjustment = BigInt.fromI32(0);
export let dayAdjustment = BigInt.fromI32(0);
export let weekAdjustment = BigInt.fromI32(345600);

export function getMinuteOpenTime(timestamp: BigInt): BigInt {
  let interval = minute;
  let adjustment = minuteAdjustment;
  return getOpenTime(timestamp, interval, adjustment);
}

export function getTenMinuteOpenTime(timestamp: BigInt): BigInt {
  let interval = minute.times(BigInt.fromI32(10));
  let adjustment = minuteAdjustment;
  return getOpenTime(timestamp, interval, adjustment);
}

export function getHourOpenTime(timestamp: BigInt): BigInt {
  let interval = hour;
  let adjustment = hourAdjustment;
  return getOpenTime(timestamp, interval, adjustment);
}

export function getDayOpenTime(timestamp: BigInt): BigInt {
  let interval = day;
  let adjustment = dayAdjustment;
  return getOpenTime(timestamp, interval, adjustment);
}

export function getWeekOpenTime(timestamp: BigInt): BigInt {
  let interval = week;
  let adjustment = weekAdjustment;
  return getOpenTime(timestamp, interval, adjustment);
}

export function getOpenTime(timestamp: BigInt, interval: BigInt, adjustment: BigInt): BigInt {
  let excess = timestamp.minus(adjustment).mod(interval);
  return timestamp.minus(excess);
}
