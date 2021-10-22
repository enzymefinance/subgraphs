import { Counter } from '../generated/schema';

export function getCounter(id: string): i32 {
  let counter = Counter.load(id);
  if (counter == null) {
    counter = new Counter(id);
    counter.count = 0;
  }

  counter.count = counter.count + 1;
  counter.save();

  return counter.count;
}

export function getTransferCounter(): i32 {
  return getCounter('transfers');
}

export function getDepositMetricCounter(): i32 {
  return getCounter('deposit-metrics');
}
