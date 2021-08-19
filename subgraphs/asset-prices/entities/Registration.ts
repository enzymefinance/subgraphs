import { store, Address, Entity, Value, ethereum, BigInt } from '@graphprotocol/graph-ts';
import { arrayUnique, arrayDiff, ONE_DAY } from '@enzymefinance/subgraph-utils';
import {
  PrimitiveRegistration,
  DerivativeRegistration,
  CurrencyRegistration,
  Aggregator,
  AggregatorProxy,
  Asset,
} from '../generated/schema';
import { getCurrencyAggregator } from '../utils/getCurrencyAggregator';
import { unwrapAggregator } from '../utils/unwrapAggregator';
import { getOrCreateAggregatorProxy, getOrCreateAggregator } from './Aggregator';
import { getOrCreateAsset } from './Asset';
import { updateDerivativeRegistry } from './DerivativeRegistry';
import { updateUsdQuotedPrimitiveRegistry } from './UsdQuotedPrimitiveRegistry';

export function createCurrencyRegistration(currencyId: string): CurrencyRegistration {
  let registrationId = currencyRegistrationId(currencyId);
  let registration = CurrencyRegistration.load(currencyId) as CurrencyRegistration;
  if (registration != null) {
    return registration;
  }

  let proxyAddress = getCurrencyAggregator(currencyId);
  registration = new CurrencyRegistration(registrationId);
  registration.type = 'CURRENCY';
  registration.currency = currencyId;
  registration.proxy = proxyAddress.toHex();
  registration.save();

  let aggregatorAddress = unwrapAggregator(proxyAddress);
  addRegistrationToAggregatorProxy(proxyAddress, registrationId);
  addProxyToAggregator(proxyAddress, aggregatorAddress);

  return registration;
}

export function createDerivativeRegistration(
  assetAddress: Address,
  releaseVersion: number,
  event: ethereum.Event,
): DerivativeRegistration {
  let registrationId = derivativeRegistrationId(assetAddress, releaseVersion);
  let registration = DerivativeRegistration.load(registrationId) as DerivativeRegistration;
  if (registration != null) {
    return registration;
  }

  registration = new DerivativeRegistration(registrationId);
  registration.type = 'DERIVATIVE';
  registration.asset = assetAddress.toHex();
  registration.version = releaseVersion as i32;
  registration.save();

  addRegistrationToAsset(assetAddress, registrationId, releaseVersion, event);

  return registration;
}

export function createOrUpdatePrimitiveRegistration(
  assetAddress: Address,
  proxyAddress: Address,
  releaseVersion: number,
  event: ethereum.Event,
  quoteCurrency: string | null = null,
): PrimitiveRegistration {
  let previous = removePrimitiveRegistration(assetAddress, releaseVersion, event);
  let registrationId = primitiveRegistrationId(assetAddress, releaseVersion);
  let registration = new PrimitiveRegistration(registrationId);
  registration.type = 'PRIMITIVE';
  registration.quote = quoteCurrency == null ? (previous == null ? 'ETH' : previous.quote) : quoteCurrency;
  registration.asset = assetAddress.toHex();
  registration.proxy = proxyAddress.toHex();
  registration.version = releaseVersion as i32;
  registration.save();

  let aggregatorAddress = unwrapAggregator(proxyAddress);
  addRegistrationToAggregatorProxy(proxyAddress, registrationId);
  addProxyToAggregator(proxyAddress, aggregatorAddress);
  addRegistrationToAsset(assetAddress, registrationId, releaseVersion, event);

  return registration;
}

export function removePrimitiveRegistration(
  assetAddress: Address,
  releaseVersion: number,
  event: ethereum.Event,
): PrimitiveRegistration | null {
  let registrationId = primitiveRegistrationId(assetAddress, releaseVersion);
  let registration = PrimitiveRegistration.load(registrationId);
  if (registration == null) {
    return null;
  }

  // Delete the registration entity.
  store.remove('PrimitiveRegistration', registration.id);
  removeRegistrationFromAggregatorProxy(Address.fromString(registration.proxy), registrationId);
  removeRegistrationFromAsset(assetAddress, registrationId, releaseVersion, event);

  return registration;
}

export function removeDerivativeRegistration(
  assetAddress: Address,
  releaseVersion: number,
  event: ethereum.Event,
): DerivativeRegistration | null {
  let registrationId = primitiveRegistrationId(assetAddress, releaseVersion);
  let registration = DerivativeRegistration.load(registrationId);
  if (registration == null) {
    return null;
  }

  // Delete the registration entity.
  store.remove('DerivativeRegistration', registration.id);
  removeRegistrationFromAsset(assetAddress, registrationId, releaseVersion, event);

  return registration;
}

export function getUpdatedAggregator(aggregatorAddress: Address, event: ethereum.Event): Aggregator {
  // Only check for aggregator updates once every 24 hours.
  let aggregator = getOrCreateAggregator(aggregatorAddress);
  if (BigInt.fromI32(aggregator.updated).plus(ONE_DAY).gt(event.block.timestamp)) {
    return aggregator;
  }

  let proxies = aggregator.proxies;
  for (let i: i32 = 0; i < proxies.length; i++) {
    let address = Address.fromString(proxies[i]);
    let unwrapped = unwrapAggregator(address);

    // Check if the proxy has been pointed at a new aggregator.
    if (unwrapped.notEqual(aggregatorAddress)) {
      // Spawn the new aggregator.
      addProxyToAggregator(address, unwrapped);

      // Remove the reference on the old aggregator.
      aggregator.proxies = arrayDiff<string>(aggregator.proxies, [aggregatorAddress.toHex()]);
    }
  }

  aggregator.updated = event.block.timestamp.toI32();
  aggregator.save();

  return aggregator;
}

export function getActiveRegistration(asset: Asset): AssetRegistration | null {
  let registrations = asset.registrations;
  let registration: AssetRegistration | null = null;
  if (registrations.length) {
    registration = AssetRegistration.load(registrations[0]);
  }

  return registration;
}

function addRegistrationToAsset(
  assetAddress: Address,
  registrationId: string,
  releaseVersion: number,
  event: ethereum.Event,
): Asset {
  // Update registrations sorted by priority.
  let asset = getOrCreateAsset(assetAddress, releaseVersion, event);
  let registrations = arrayUnique<string>(asset.registrations.concat([registrationId]))
    .map<AssetRegistration>((id) => AssetRegistration.load(id) as AssetRegistration)
    .filter((registration) => registration != null)
    .sort((a, b) => b.version - a.version);

  asset.registrations = registrations.map<string>((registration) => registration.id);
  asset.save();

  updateDerivativeRegistry(asset);
  updateUsdQuotedPrimitiveRegistry(asset);

  return asset;
}

function addRegistrationToAggregatorProxy(proxyAddress: Address, registrationId: string): AggregatorProxy {
  // Register the registration entity with the aggregator proxy entity.
  let proxy = getOrCreateAggregatorProxy(proxyAddress);
  proxy.registrations = proxy.registrations.concat([registrationId]);
  proxy.save();

  return proxy;
}

function addProxyToAggregator(proxyAddress: Address, aggregatorAddress: Address): Aggregator {
  // Register the aggregator proxy with the aggregator entity.
  let aggregator = getOrCreateAggregator(aggregatorAddress);
  aggregator.proxies = arrayUnique<string>(aggregator.proxies.concat([proxyAddress.toHex()]));
  aggregator.save();

  return aggregator;
}

function removeRegistrationFromAsset(
  assetAddress: Address,
  registrationId: string,
  releaseVersion: number,
  event: ethereum.Event,
): Asset {
  let asset = getOrCreateAsset(assetAddress, releaseVersion, event);
  let removed = arrayDiff<string>(asset.registrations, [registrationId]);
  let registrations = arrayUnique<string>(removed.concat([registrationId]))
    .map<AssetRegistration>((id) => AssetRegistration.load(id) as AssetRegistration)
    .filter((registration) => registration != null)
    .sort((a, b) => b.version - a.version);

  asset.registrations = registrations.map<string>((registration) => registration.id);
  asset.save();

  updateDerivativeRegistry(asset);
  updateUsdQuotedPrimitiveRegistry(asset);

  return asset;
}

function removeRegistrationFromAggregatorProxy(proxyAddress: Address, registrationId: string): AggregatorProxy {
  // Deregister the registration entity from the aggregator proxy entity.
  let proxy = getOrCreateAggregatorProxy(proxyAddress);
  proxy.registrations = arrayDiff<string>(proxy.registrations, [registrationId]);
  proxy.save();

  return proxy;
}

function primitiveRegistrationId(assetAddress: Address, releaseVersion: number): string {
  return 'PRIMITIVE/' + assetAddress.toHex() + '/' + BigInt.fromI32(releaseVersion as i32).toString();
}

function derivativeRegistrationId(assetAddress: Address, releaseVersion: number): string {
  return 'DERIVATIVE/' + assetAddress.toHex() + '/' + BigInt.fromI32(releaseVersion as i32).toString();
}

function currencyRegistrationId(currency: string): string {
  return 'CURRENCY/' + currency;
}

export class Registration extends Entity {
  constructor(id: string, type: string) {
    super();
    this.set('id', Value.fromString(id));
    this.set('type', Value.fromString(type));
  }

  save(): void {
    let entity = '';
    let type = this.type;

    if (type == 'PRIMITIVE') {
      entity = 'PrimitiveRegistration';
    } else if (type == 'DERIVATIVE') {
      entity = 'DerivativeRegistration';
    } else if (type == 'CURRENCY') {
      entity = 'CurrencyRegistration';
    } else {
      return;
    }

    store.set(entity, this.id, this);
  }

  static entity(id: string): string | null {
    let type = id.split('/', 1)[0];

    if (type == 'PRIMITIVE') {
      return 'PrimitiveRegistration';
    }

    if (type == 'DERIVATIVE') {
      return 'DerivativeRegistration';
    }

    if (type == 'CURRENCY') {
      return 'CurrencyRegistration';
    }

    return null;
  }

  static remove(id: string): void {
    let entity = this.entity(id);
    if (entity == null) {
      return;
    }

    store.remove(entity, id);
  }

  static load(id: string): Registration | null {
    let entity = this.entity(id);
    if (entity == null) {
      return null;
    }

    return store.get(entity, id) as Registration | null;
  }

  get id(): string {
    let value = this.get('id') as Value;
    return value.toString();
  }

  set id(value: string) {
    this.set('id', Value.fromString(value));
  }

  get type(): string {
    let value = this.get('type') as Value;
    return value.toString();
  }

  set type(value: string) {
    this.set('type', Value.fromString(value));
  }
}

export class AssetRegistration extends Entity {
  constructor(id: string, type: string) {
    super();
    this.set('id', Value.fromString(id));
    this.set('type', Value.fromString(type));
  }

  save(): void {
    let entity = '';
    let type = this.type;

    if (type == 'PRIMITIVE') {
      entity = 'PrimitiveRegistration';
    } else if (type == 'DERIVATIVE') {
      entity = 'DerivativeRegistration';
    } else {
      return;
    }

    store.set(entity, this.id, this);
  }

  static entity(id: string): string | null {
    let type = id.split('/', 1)[0];

    if (type == 'PRIMITIVE') {
      return 'PrimitiveRegistration';
    }

    if (type == 'DERIVATIVE') {
      return 'DerivativeRegistration';
    }

    return null;
  }

  static remove(id: string): void {
    let entity = this.entity(id);
    if (entity == null) {
      return;
    }

    store.remove(entity, id);
  }

  static load(id: string): AssetRegistration | null {
    let entity = this.entity(id);
    if (entity == null) {
      return null;
    }

    return store.get(entity, id) as AssetRegistration | null;
  }

  get id(): string {
    let value = this.get('id') as Value;
    return value.toString();
  }

  set id(value: string) {
    this.set('id', Value.fromString(value));
  }

  get type(): string {
    let value = this.get('type') as Value;
    return value.toString();
  }

  set type(value: string) {
    this.set('type', Value.fromString(value));
  }

  get asset(): string {
    let value = this.get('asset') as Value;
    return value.toString();
  }

  set asset(value: string) {
    this.set('asset', Value.fromString(value));
  }

  get version(): i32 {
    let value = this.get('version') as Value;
    return value.toI32();
  }

  set version(value: i32) {
    this.set('version', Value.fromI32(value));
  }
}
