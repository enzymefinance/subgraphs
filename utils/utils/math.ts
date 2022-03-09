import { BigDecimal, BigInt } from '@graphprotocol/graph-ts';
import { UINT256_MAX, UINT256_MAX_BD, ZERO_BD, ZERO_BI } from '../constants';

export function toBigDecimal(quantity: BigInt, decimals: i32 = 18): BigDecimal {
  if (quantity.equals(UINT256_MAX)) {
    return UINT256_MAX_BD;
  }

  return quantity.divDecimal(
    BigInt.fromI32(10)
      .pow(decimals as u8)
      .toBigDecimal(),
  );
}

export function minBigDecimal(values: BigDecimal[]): BigDecimal {
  let min = ZERO_BD;
  for (let i = 0; i < values.length; i++) {
    if (min.gt(values[i])) {
      min = values[i];
    }
  }

  return min;
}

export function maxBigDecimal(values: BigDecimal[]): BigDecimal {
  let max = ZERO_BD;
  for (let i = 0; i < values.length; i++) {
    if (max.lt(values[i])) {
      max = values[i];
    }
  }

  return max;
}

export function averageBigDecimal(values: BigDecimal[]): BigDecimal {
  let sum = ZERO_BD;
  for (let i = 0; i < values.length; i++) {
    sum = sum.plus(values[i]);
  }

  return sum.div(BigDecimal.fromString(BigInt.fromI32(values.length).toString()));
}

export function medianBigDecimal(values: BigDecimal[]): BigDecimal {
  let sorted = values.sort((a, b) => {
    return a.equals(b) ? 0 : a.gt(b) ? 1 : -1;
  });

  let mid = Math.ceil(sorted.length / 2) as i32;
  if (sorted.length % 2 == 0) {
    return sorted[mid].plus(sorted[mid - 1]).div(BigDecimal.fromString('2'));
  }

  return sorted[mid - 1];
}

export function minBigInt(values: BigInt[]): BigInt {
  let min = ZERO_BI;
  for (let i = 0; i < values.length; i++) {
    if (min.gt(values[i])) {
      min = values[i];
    }
  }

  return min;
}

export function maxBigInt(values: BigInt[]): BigInt {
  let max = ZERO_BI;
  for (let i = 0; i < values.length; i++) {
    if (max.lt(values[i])) {
      max = values[i];
    }
  }

  return max;
}

export function averageBigInt(values: BigInt[]): BigInt {
  let sum = ZERO_BI;
  for (let i = 0; i < values.length; i++) {
    sum = sum.plus(values[i]);
  }

  return sum.div(BigInt.fromI32(values.length));
}

export function medianBigInt(values: BigInt[]): BigInt {
  let sorted = values.sort((a, b) => {
    return a.equals(b) ? 0 : a.gt(b) ? 1 : -1;
  });

  let mid = Math.ceil(sorted.length / 2) as i32;
  if (sorted.length % 2 == 0) {
    return sorted[mid].plus(sorted[mid - 1]).div(BigInt.fromString('2'));
  }

  return sorted[mid - 1];
}

export function saveDivideBigDecimal(a: BigDecimal, b: BigDecimal): BigDecimal {
  if (a.equals(ZERO_BD) || b.equals(ZERO_BD)) {
    return ZERO_BD;
  }

  return a.div(b);
}

export function saveDivideBigInt(a: BigInt, b: BigInt): BigInt {
  if (a.equals(ZERO_BI) || b.equals(ZERO_BI)) {
    return ZERO_BI;
  }

  return a.div(b);
}
