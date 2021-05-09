import { BigDecimal, BigInt } from '@graphprotocol/graph-ts';

export function toBigDecimal(quantity: BigInt, decimals: i32 = 18): BigDecimal {
  return quantity.divDecimal(
    BigInt.fromI32(10)
      .pow(decimals as u8)
      .toBigDecimal(),
  );
}

export function averageBigDecimal(prices: BigDecimal[]): BigDecimal {
  let sum = BigDecimal.fromString('0');
  for (let i = 0; i < prices.length; i++) {
    sum = sum.plus(prices[i]);
  }

  return sum.div(BigDecimal.fromString(BigInt.fromI32(prices.length).toString()));
}

export function medianBigDecimal(prices: BigDecimal[]): BigDecimal {
  let sorted = prices.sort((a, b) => {
    return a.equals(b) ? 0 : a.gt(b) ? 1 : -1;
  });

  let mid = Math.ceil(sorted.length / 2) as i32;
  if (sorted.length % 2 == 0) {
    return sorted[mid].plus(sorted[mid - 1]).div(BigDecimal.fromString('2'));
  }

  return sorted[mid - 1];
}

export function averageBigInt(prices: BigInt[]): BigInt {
  let sum = BigInt.fromString('0');
  for (let i = 0; i < prices.length; i++) {
    sum = sum.plus(prices[i]);
  }

  return sum.div(BigInt.fromI32(prices.length));
}

export function medianBigInt(prices: BigInt[]): BigInt {
  let sorted = prices.sort((a, b) => {
    return a.equals(b) ? 0 : a.gt(b) ? 1 : -1;
  });

  let mid = Math.ceil(sorted.length / 2) as i32;
  if (sorted.length % 2 == 0) {
    return sorted[mid].plus(sorted[mid - 1]).div(BigInt.fromString('2'));
  }

  return sorted[mid - 1];
}
