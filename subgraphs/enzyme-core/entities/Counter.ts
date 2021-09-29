import { Counter } from '../generated/schema';

export function getActivityCounter(): i32 {
  let counter = Counter.load('metricId');

  if (counter == null) {
    counter = new Counter('metricId');
    counter.activityCounter = 0;
    counter.depositMetricCounter = 1;
    counter.vaultMetricCounter = 0;
    counter.save();

    return counter.activityCounter;
  }

  counter.activityCounter = counter.activityCounter + 1;
  counter.save();

  return counter.activityCounter;
}

export function getDepositMetricCounter(): i32 {
  let counter = Counter.load('metricId');

  if (counter == null) {
    counter = new Counter('metricId');
    counter.activityCounter = 0;
    counter.depositMetricCounter = 1;
    counter.vaultMetricCounter = 0;
    counter.save();

    return counter.depositMetricCounter;
  }

  counter.depositMetricCounter = counter.depositMetricCounter + 1;
  counter.save();

  return counter.depositMetricCounter;
}

export function getVaultMetricCounter(): i32 {
  let counter = Counter.load('metricId');

  if (counter == null) {
    counter = new Counter('metricId');
    counter.activityCounter = 0;
    counter.depositMetricCounter = 0;
    counter.vaultMetricCounter = 1;
    counter.save();

    return counter.vaultMetricCounter;
  }

  counter.vaultMetricCounter = counter.vaultMetricCounter + 1;
  counter.save();

  return counter.vaultMetricCounter;
}
