import { Counter } from '../generated/schema';

export function getCounter(id: string): i32 {
  let counter = Counter.load(id);
  if (counter == null) {
    counter = new Counter(id);
    counter.count = 0;
  } else {
    counter.count = counter.count + 1;
  }

  counter.save();

  return counter.count;
}

export function getTransferCounter(): i32 {
  return getCounter('transfers');
}
