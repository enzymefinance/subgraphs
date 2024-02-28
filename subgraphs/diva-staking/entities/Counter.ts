import { Counter } from '../generated/schema';

export let activitiesCounterId = 'activities';
export let depositsCounterId = 'deposits';
export let redemptionsCounterId = 'redemptions';
export let depositorsCounterId = 'depositors';
export let activeDepositorsCounterId = 'activeDepositors';

export function increaseCounter(id: string, updatedAt: i32): i32 {
  let counter = Counter.load(id);

  if (counter == null) {
    counter = new Counter(id);
    counter.count = 0;
  }

  counter.count = counter.count + 1;
  counter.updatedAt = updatedAt;
  counter.save();

  return counter.count;
}

export function decreaseCounter(id: string, updatedAt: i32): i32 {
  let counter = Counter.load(id);

  if (counter == null) {
    counter = new Counter(id);
    counter.count = 0;
  }

  counter.count = counter.count - 1;
  counter.updatedAt = updatedAt;
  counter.save();

  return counter.count;
}
