import { BigInt } from '@graphprotocol/graph-ts';
import { MONTHS, ONE, ONE_DAY, ONE_HOUR, ONE_MINUTE, TEN_MINUTES } from '../constants';

function openTime(timestamp: BigInt, interval: BigInt): BigInt {
  let excess = timestamp.mod(interval);
  return timestamp.minus(excess);
}

export function minuteOpenTime(timestamp: BigInt): BigInt {
  return openTime(timestamp, ONE_MINUTE);
}

export function minuteCloseTime(timestamp: BigInt): BigInt {
  return minuteOpenTime(timestamp).plus(ONE_MINUTE).minus(ONE);
}

export function tenMinuteOpenTime(timestamp: BigInt): BigInt {
  return openTime(timestamp, TEN_MINUTES);
}

export function tenMinuteCloseTime(timestamp: BigInt): BigInt {
  return tenMinuteOpenTime(timestamp).plus(TEN_MINUTES).minus(ONE);
}

export function hourOpenTime(timestamp: BigInt): BigInt {
  return openTime(timestamp, ONE_HOUR);
}

export function hourCloseTime(timestamp: BigInt): BigInt {
  return hourOpenTime(timestamp).plus(ONE_HOUR).minus(ONE);
}

export function dayOpenTime(timestamp: BigInt): BigInt {
  return openTime(timestamp, ONE_DAY);
}

export function dayCloseTime(timestamp: BigInt): BigInt {
  return dayOpenTime(timestamp).plus(ONE_DAY).minus(ONE);
}

export function monthOpenTime(timestamp: BigInt): BigInt {
  return monthOpenAndClose(timestamp)[0];
}

export function monthCloseTime(timestamp: BigInt): BigInt {
  return monthOpenAndClose(timestamp)[1];
}

export function monthOpenAndClose(timestamp: BigInt): BigInt[] {
  for (let i = 0; i < MONTHS.length - 1; i++) {
    if (timestamp.lt(MONTHS[i + 1]) && timestamp.ge(MONTHS[i])) {
      return [MONTHS[i], MONTHS[i + 1].minus(ONE)];
    }
  }

  return [BigInt.fromI32(0), BigInt.fromI32(0)];
}

export function isSameHour(a: BigInt, b: BigInt): boolean {
  let aStart = hourOpenTime(a);
  let bStart = hourOpenTime(b);

  return aStart.equals(bStart);
}

export function isSameDay(a: BigInt, b: BigInt): boolean {
  let aStart = dayOpenTime(a);
  let bStart = dayOpenTime(b);

  return aStart.equals(bStart);
}

export function isSameMonth(a: BigInt, b: BigInt): boolean {
  let aStart = monthOpenTime(a);
  let bStart = monthOpenTime(b);

  return aStart.equals(bStart);
}
