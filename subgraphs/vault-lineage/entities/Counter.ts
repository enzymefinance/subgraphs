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

export function getVaultCounter(): i32 {
  return getCounter('vaults');
}

export function getComptrollerCounter(): i32 {
  return getCounter('comptrollers');
}

export function getReleaseCounter(): i32 {
  return getCounter('releases') + 1;
}
