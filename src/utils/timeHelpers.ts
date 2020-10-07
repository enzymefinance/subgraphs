import { BigInt } from '@graphprotocol/graph-ts';

export let minute = BigInt.fromI32(60);
export let hour = BigInt.fromI32(3600);
export let day = BigInt.fromI32(86400);

export function getMinuteOpenTime(timestamp: BigInt): BigInt {
  let interval = minute;
  return getOpenTime(timestamp, interval);
}

export function getTenMinuteOpenTime(timestamp: BigInt): BigInt {
  let interval = minute.times(BigInt.fromI32(10));
  return getOpenTime(timestamp, interval);
}

export function getHourOpenTime(timestamp: BigInt): BigInt {
  let interval = hour;
  return getOpenTime(timestamp, interval);
}

export function getDayOpenTime(timestamp: BigInt): BigInt {
  let interval = day;
  return getOpenTime(timestamp, interval);
}

export function getOpenTime(timestamp: BigInt, interval: BigInt): BigInt {
  let excess = timestamp.mod(interval);
  return timestamp.minus(excess);
}
