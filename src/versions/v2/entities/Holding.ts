import { Entity, Value, BigInt } from '@graphprotocol/graph-ts';
import { Fund, FundHolding } from '../generated/schema';

export class Holding extends Entity {
  get id(): string {
    let value = this.get('id');
    return value.toString();
  }

  set id(value: string) {
    this.set('id', Value.fromString(value));
  }

  get fund(): string {
    let value = this.get('fund');
    return value.toString();
  }

  set fund(value: string) {
    this.set('fund', Value.fromString(value));
  }

  get timestamp(): BigInt {
    let value = this.get('timestamp');
    return value.toBigInt();
  }

  set timestamp(value: BigInt) {
    this.set('timestamp', Value.fromBigInt(value));
  }

  get identifier(): string {
    let value = this.get('identifier');
    return value.toString();
  }

  set identifier(value: string) {
    this.set('identifier', Value.fromString(value));
  }
}

export function ensureFundHoldings(fund: Fund): FundHolding[] {
  return [] as FundHolding[];
}
