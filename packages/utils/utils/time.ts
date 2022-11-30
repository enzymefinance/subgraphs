import { BigInt } from '@graphprotocol/graph-ts';
import { MONTHS, ONE_BI, ONE_DAY, ONE_HOUR, ONE_MINUTE, TEN_MINUTES, ZERO_BI } from '../constants';

export class TimeRange {
  public from: BigInt;
  public to: BigInt;

  constructor(from: BigInt, to: BigInt) {
    this.from = from;
    this.to = to;
  }
}

function openTime(timestamp: BigInt, interval: BigInt): BigInt {
  let excess = timestamp.mod(interval);
  return timestamp.minus(excess);
}

export function minuteOpenTime(timestamp: BigInt): BigInt {
  return openTime(timestamp, ONE_MINUTE);
}

export function minuteCloseTime(timestamp: BigInt): BigInt {
  return minuteOpenTime(timestamp).plus(ONE_MINUTE).minus(ONE_BI);
}

export function minuteTimeRange(timestamp: BigInt): TimeRange {
  return new TimeRange(minuteOpenTime(timestamp), minuteCloseTime(timestamp));
}

export function tenMinuteOpenTime(timestamp: BigInt): BigInt {
  return openTime(timestamp, TEN_MINUTES);
}

export function tenMinuteCloseTime(timestamp: BigInt): BigInt {
  return tenMinuteOpenTime(timestamp).plus(TEN_MINUTES).minus(ONE_BI);
}

export function tenMinuteTimeRange(timestamp: BigInt): TimeRange {
  return new TimeRange(tenMinuteOpenTime(timestamp), tenMinuteCloseTime(timestamp));
}

export function hourOpenTime(timestamp: BigInt): BigInt {
  return openTime(timestamp, ONE_HOUR);
}

export function hourCloseTime(timestamp: BigInt): BigInt {
  return hourOpenTime(timestamp).plus(ONE_HOUR).minus(ONE_BI);
}

export function hourTimeRange(timestamp: BigInt): TimeRange {
  return new TimeRange(hourOpenTime(timestamp), hourCloseTime(timestamp));
}

export function dayOpenTime(timestamp: BigInt): BigInt {
  return openTime(timestamp, ONE_DAY);
}

export function dayCloseTime(timestamp: BigInt): BigInt {
  return dayOpenTime(timestamp).plus(ONE_DAY).minus(ONE_BI);
}

export function dayTimeRange(timestamp: BigInt): TimeRange {
  return new TimeRange(dayOpenTime(timestamp), dayCloseTime(timestamp));
}

export function monthOpenTime(timestamp: BigInt): BigInt {
  return monthOpenAndClose(timestamp)[0];
}

export function monthCloseTime(timestamp: BigInt): BigInt {
  return monthOpenAndClose(timestamp)[1];
}

export function monthTimeRange(timestamp: BigInt): TimeRange {
  for (let i = 0; i < MONTHS.length - 1; i++) {
    if (timestamp.lt(MONTHS[i + 1]) && timestamp.ge(MONTHS[i])) {
      return new TimeRange(MONTHS[i], MONTHS[i + 1].minus(ONE_BI));
    }
  }

  return new TimeRange(ZERO_BI, ZERO_BI);
}

export function monthOpenAndClose(timestamp: BigInt): BigInt[] {
  for (let i = 0; i < MONTHS.length - 1; i++) {
    if (timestamp.lt(MONTHS[i + 1]) && timestamp.ge(MONTHS[i])) {
      return [MONTHS[i], MONTHS[i + 1].minus(ONE_BI)];
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
