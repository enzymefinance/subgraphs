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

export function getActivityCounter(): i32 {
  return getCounter('activities');
}

export function getDepositMetricCounter(): i32 {
  return getCounter('desposits');
}

export function getVaultMetricCounter(): i32 {
  return getCounter('metrics');
}

export function getVaultCounter(): i32 {
  return getCounter('vaults');
}
