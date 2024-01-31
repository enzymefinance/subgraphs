import { ZERO_BD } from '@enzymefinance/subgraph-utils';
import { Amount } from '../generated/schema';
import { BigDecimal } from '@graphprotocol/graph-ts';

export let currentTvlAmountId = 'currentTvl';
export let sumOfDepositsAmountId = 'sumOfDeposits';
export let sumOfRedemptionsAmountId = 'sumOfRedemptions';

export function getAmount(id: string): BigDecimal {
  let amount = Amount.load(id);

  if (amount != null) {
    return amount.amount;
  }
  amount = new Amount(id);
  amount.amount = ZERO_BD;
  amount.updatedAt = 0;
  amount.save();

  return amount.amount;
}

export function increaseAmount(id: string, increase: BigDecimal, updatedAt: i32): BigDecimal {
  let amount = Amount.load(id);
  if (amount == null) {
    amount = new Amount(id);
    amount.amount = ZERO_BD;
  }

  amount.amount = amount.amount.plus(increase);
  amount.updatedAt = updatedAt;
  amount.save();

  return amount.amount;
}

export function decreaseAmount(id: string, increase: BigDecimal, updatedAt: i32): BigDecimal {
  let amount = Amount.load(id);
  if (amount == null) {
    amount = new Amount(id);
    amount.amount = ZERO_BD;
  }

  amount.amount = amount.amount.minus(increase);
  amount.updatedAt = updatedAt;
  amount.save();

  return amount.amount;
}
