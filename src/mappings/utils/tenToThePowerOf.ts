import { BigInt } from "@graphprotocol/graph-ts";

// helper function because graph-ts doesn't have a bigInt.power() function
export function tenToThePowerOf(exponent: BigInt): BigInt {
  let result = BigInt.fromI32(1);
  for (let i: i32 = 0; i < exponent.toI32(); i++) {
    result = result.times(BigInt.fromI32(10));
  }
  return result;
}
