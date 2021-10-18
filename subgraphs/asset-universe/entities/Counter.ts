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

export function getAssetCounter(): i32 {
  return getCounter('asset');
}

export function getRegistrationCounter(): i32 {
  return getCounter('registration');
}

export function getRegistrationChangeCounter(): i32 {
  return getCounter('change');
}
