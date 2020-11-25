import { BigInt, Entity, store, Value } from '@graphprotocol/graph-ts';

export class PriceCandleGroup extends Entity {
  constructor(id: string) {
    super();
    this.set('id', Value.fromString(id));
  }

  save(type: string): void {
    store.set(type + 'PriceCandleGroup', this.get('id').toString(), this);
  }

  static load(type: string, id: string): PriceCandleGroup | null {
    return store.get(type + 'PriceCandleGroup', id) as PriceCandleGroup | null;
  }

  get id(): string {
    let value = this.get('id');
    return value.toString();
  }

  set id(value: string) {
    this.set('id', Value.fromString(value));
  }

  get from(): BigInt {
    let value = this.get('from');
    return value.toBigInt();
  }

  set from(value: BigInt) {
    this.set('from', Value.fromBigInt(value));
  }

  get to(): BigInt {
    let value = this.get('to');
    return value.toBigInt();
  }

  set to(value: BigInt) {
    this.set('to', Value.fromBigInt(value));
  }
}
