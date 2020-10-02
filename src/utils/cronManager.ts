import { BigInt } from '@graphprotocol/graph-ts';
import { Cron } from '../generated/schema';
import { getHourlyOpenTime } from './timeHelpers';

function maintainCronTimer(timestamp: BigInt): BigInt {
  let cron = Cron.load('SINGLETON') as Cron;
  if (cron == null) {
    cron = new Cron('SINGLETON');
    cron.latest = BigInt.fromI32(0);
    cron.save();
  }

  if (cron.latest.lt(timestamp)) {
    cron.latest = timestamp;
    cron.save();
  }

  return cron.latest;
}

export function triggerCron(timestamp: BigInt): void {
  let previous = maintainCronTimer(timestamp);
  if (previous.ge(timestamp)) {
    // We've been here before. No need to run the cron job.
    return;
  }

  let previousHour = getHourlyOpenTime(timestamp);
  let currentHour = getHourlyOpenTime(timestamp);
  if (currentHour.gt(previousHour)) {
    // TODO: Add logic to maintain hourly/daily/weekly candles and trigger updates
    // for all derivates in predefined time intervals.
  }
}
