import { BigInt, Entity, Value, store, BigDecimal } from '@graphprotocol/graph-ts';

export class AssetPriceAggregate extends Entity {
  constructor(id: string) {
    super();
    this.set('id', Value.fromString(id));
  }

  save(type: string): void {
    store.set(type + 'AssetPriceAggregate', this.get('id').toString(), this);
  }

  static load(type: string, id: string): AssetPriceAggregate | null {
    return store.get(type + 'AssetPriceAggregate', id) as AssetPriceAggregate | null;
  }

  get id(): string {
    let value = this.get('id');
    return value.toString();
  }

  set id(value: string) {
    this.set('id', Value.fromString(value));
  }

  get openTimestamp(): BigInt {
    let value = this.get('openTimestamp');
    return value.toBigInt();
  }

  set openTimestamp(value: BigInt) {
    this.set('openTimestamp', Value.fromBigInt(value));
  }

  get closeTimestamp(): BigInt {
    let value = this.get('closeTimestamp');
    return value.toBigInt();
  }

  set closeTimestamp(value: BigInt) {
    this.set('closeTimestamp', Value.fromBigInt(value));
  }

  get candles(): Array<string> {
    let value = this.get('candles');
    return value.toStringArray();
  }

  set candles(value: Array<string>) {
    this.set('candles', Value.fromStringArray(value));
  }
}

export class AssetPriceCandle extends Entity {
  constructor(id: string) {
    super();
    this.set('id', Value.fromString(id));
  }

  save(type: string): void {
    store.set(type + 'AssetPriceCandle', this.get('id').toString(), this);
  }

  static load(type: string, id: string): AssetPriceCandle | null {
    return store.get(type + 'AssetPriceCandle', id) as AssetPriceCandle | null;
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

  get asset(): string {
    let value = this.get('asset');
    return value.toString();
  }

  set asset(value: string) {
    this.set('asset', Value.fromString(value));
  }

  get openTimestamp(): BigInt {
    let value = this.get('openTimestamp');
    return value.toBigInt();
  }

  set openTimestamp(value: BigInt) {
    this.set('openTimestamp', Value.fromBigInt(value));
  }

  get closeTimestamp(): BigInt {
    let value = this.get('closeTimestamp');
    return value.toBigInt();
  }

  set closeTimestamp(value: BigInt) {
    this.set('closeTimestamp', Value.fromBigInt(value));
  }

  get averagePrice(): BigDecimal {
    let value = this.get('averagePrice');
    return value.toBigDecimal();
  }

  set averagePrice(value: BigDecimal) {
    this.set('averagePrice', Value.fromBigDecimal(value));
  }

  get medianPrice(): BigDecimal {
    let value = this.get('medianPrice');
    return value.toBigDecimal();
  }

  set medianPrice(value: BigDecimal) {
    this.set('medianPrice', Value.fromBigDecimal(value));
  }

  get openPrice(): BigDecimal {
    let value = this.get('openPrice');
    return value.toBigDecimal();
  }

  set openPrice(value: BigDecimal) {
    this.set('openPrice', Value.fromBigDecimal(value));
  }

  get closePrice(): BigDecimal {
    let value = this.get('closePrice');
    return value.toBigDecimal();
  }

  set closePrice(value: BigDecimal) {
    this.set('closePrice', Value.fromBigDecimal(value));
  }

  get lowPrice(): BigDecimal {
    let value = this.get('lowPrice');
    return value.toBigDecimal();
  }

  set lowPrice(value: BigDecimal) {
    this.set('lowPrice', Value.fromBigDecimal(value));
  }

  get highPrice(): BigDecimal {
    let value = this.get('highPrice');
    return value.toBigDecimal();
  }

  set highPrice(value: BigDecimal) {
    this.set('highPrice', Value.fromBigDecimal(value));
  }

  get includedPrices(): Array<string> {
    let value = this.get('includedPrices');
    return value.toStringArray();
  }

  set includedPrices(value: Array<string>) {
    this.set('includedPrices', Value.fromStringArray(value));
  }
}
