import { BigDecimal, BigInt, Entity, store, Value } from '@graphprotocol/graph-ts';

export class CurrencyPriceCandle extends Entity {
  constructor(id: string) {
    super();
    this.set('id', Value.fromString(id));
  }

  save(type: string): void {
    store.set(type + 'CurrencyPriceCandle', this.get('id').toString(), this);
  }

  static load(type: string, id: string): CurrencyPriceCandle | null {
    return store.get(type + 'CurrencyPriceCandle', id) as CurrencyPriceCandle | null;
  }

  get id(): string {
    let value = this.get('id');
    return value.toString();
  }

  set id(value: string) {
    this.set('id', Value.fromString(value));
  }

  get group(): string {
    let value = this.get('group');
    return value.toString();
  }

  set group(value: string) {
    this.set('group', Value.fromString(value));
  }

  get currency(): string {
    let value = this.get('currency');
    return value.toString();
  }

  set currency(value: string) {
    this.set('currency', Value.fromString(value));
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

  get open(): BigDecimal {
    let value = this.get('open');
    return value.toBigDecimal();
  }

  set open(value: BigDecimal) {
    this.set('open', Value.fromBigDecimal(value));
  }

  get openRef(): string {
    let value = this.get('openRef');
    return value.toString();
  }

  set openRef(value: string) {
    this.set('openRef', Value.fromString(value));
  }

  get close(): BigDecimal {
    let value = this.get('close');
    return value.toBigDecimal();
  }

  set close(value: BigDecimal) {
    this.set('close', Value.fromBigDecimal(value));
  }

  get closeRef(): string {
    let value = this.get('closeRef');
    return value.toString();
  }

  set closeRef(value: string) {
    this.set('closeRef', Value.fromString(value));
  }

  get low(): BigDecimal {
    let value = this.get('low');
    return value.toBigDecimal();
  }

  set low(value: BigDecimal) {
    this.set('low', Value.fromBigDecimal(value));
  }

  get lowRef(): string {
    let value = this.get('lowRef');
    return value.toString();
  }

  set lowRef(value: string) {
    this.set('lowRef', Value.fromString(value));
  }

  get high(): BigDecimal {
    let value = this.get('high');
    return value.toBigDecimal();
  }

  set high(value: BigDecimal) {
    this.set('high', Value.fromBigDecimal(value));
  }

  get highRef(): string {
    let value = this.get('highRef');
    return value.toString();
  }

  set highRef(value: string) {
    this.set('highRef', Value.fromString(value));
  }
}
