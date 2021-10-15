import { store, Address, Entity, Value, ethereum, BigInt, Bytes } from '@graphprotocol/graph-ts';
import { arrayUnique, arrayDiff, ONE_DAY } from '@enzymefinance/subgraph-utils';
import {
  PrimitiveRegistration,
  DerivativeRegistration,
  CurrencyRegistration,
  Aggregator,
  AggregatorProxy,
  Asset,
  RegistrationChange,
} from '../generated/schema';
import { getCurrencyAggregator } from '../utils/getCurrencyAggregator';
import { unwrapAggregator } from '../utils/unwrapAggregator';
import { getOrCreateAggregatorProxy, getOrCreateAggregator } from './Aggregator';
import { getOrCreateAsset } from './Asset';
import { updateDerivativeRegistry } from './DerivativeRegistry';
import { updateUsdQuotedPrimitiveRegistry } from './UsdQuotedPrimitiveRegistry';
import { sortRegistrations } from '../utils/sortRegistrations';
import { getRegistrationChangeCounter } from './Counter';

function recordRegistrationChange(registrationId: string, type: string, change: string, event: ethereum.Event): void {
  let registrationChangeId = event.transaction.hash.toHex() + '/' + event.logIndex.toString();
  let registrationChange = new RegistrationChange(registrationChangeId);
  registrationChange.registration = registrationId;
  registrationChange.type = type;
  registrationChange.change = change;
  registrationChange.timestamp = event.block.timestamp.toI32();
  registrationChange.block = event.block.number;
  registrationChange.transaction = event.transaction.hash;
  registrationChange.counter = getRegistrationChangeCounter();
  registrationChange.save();
}

export function createCurrencyRegistration(currencyId: string, event: ethereum.Event): CurrencyRegistration {
  let registrationId = currencyRegistrationId(currencyId);
  let registration = CurrencyRegistration.load(currencyId);
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
  addProxyToAggregator(proxyAddress, aggregatorAddress, event);
  recordRegistrationChange(registration.id, 'CURRENCY', 'REMOVED', event);

  return registration;
}

export function createDerivativeRegistration(
  assetAddress: Address,
  releaseVersion: Address,
  event: ethereum.Event,
): DerivativeRegistration {
  let registrationId = derivativeRegistrationId(assetAddress, releaseVersion);
  let registration = DerivativeRegistration.load(registrationId);
  if (registration != null) {
    return registration;
  }

  registration = new DerivativeRegistration(registrationId);
  registration.type = 'DERIVATIVE';
  registration.asset = assetAddress.toHex();
  registration.version = releaseVersion;
  registration.save();

  addRegistrationToAsset(assetAddress, registrationId, releaseVersion, event);
  recordRegistrationChange(registration.id, 'DERIVATIVE', 'ADDED', event);

  return registration;
}

export function createOrUpdatePrimitiveRegistration(
  assetAddress: Address,
  proxyAddress: Address,
  releaseVersion: Address,
  event: ethereum.Event,
  quoteCurrency: string | null = null,
): PrimitiveRegistration {
  let previous = removePrimitiveRegistration(assetAddress, releaseVersion, event);
  let registrationId = primitiveRegistrationId(assetAddress, releaseVersion);
  let registration = new PrimitiveRegistration(registrationId);
  registration.type = 'PRIMITIVE';
  registration.quote = (!quoteCurrency ? (!previous ? 'ETH' : previous.quote) : quoteCurrency) as string;
  registration.asset = assetAddress.toHex();
  registration.proxy = proxyAddress.toHex();
  registration.version = releaseVersion;
  registration.save();

  let aggregatorAddress = unwrapAggregator(proxyAddress);
  addRegistrationToAggregatorProxy(proxyAddress, registrationId);
  addProxyToAggregator(proxyAddress, aggregatorAddress, event);
  addRegistrationToAsset(assetAddress, registrationId, releaseVersion, event);
  recordRegistrationChange(registration.id, 'PRIMITIVE', 'ADDED', event);

  return registration;
}

export function removePrimitiveRegistration(
  assetAddress: Address,
  releaseVersion: Address,
  event: ethereum.Event,
): PrimitiveRegistration | null {
  let registrationId = primitiveRegistrationId(assetAddress, releaseVersion);
  let registration = PrimitiveRegistration.load(registrationId);
  if (registration == null) {
    return null;
  }

  removeRegistrationFromAggregatorProxy(Address.fromString(registration.proxy), registrationId);
  removeRegistrationFromAsset(assetAddress, registrationId, releaseVersion, event);
  recordRegistrationChange(registration.id, 'PRIMITIVE', 'REMOVED', event);

  return registration;
}

export function removeDerivativeRegistration(
  assetAddress: Address,
  releaseVersion: Address,
  event: ethereum.Event,
): DerivativeRegistration | null {
  let registrationId = primitiveRegistrationId(assetAddress, releaseVersion);
  let registration = DerivativeRegistration.load(registrationId);
  if (registration == null) {
    return null;
  }

  removeRegistrationFromAsset(assetAddress, registrationId, releaseVersion, event);

  return registration;
}

export function getUpdatedAggregator(aggregatorAddress: Address, event: ethereum.Event): Aggregator {
  // Only check for aggregator updates once every 24 hours.
  let aggregator = getOrCreateAggregator(aggregatorAddress, event);
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
      addProxyToAggregator(address, unwrapped, event);

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
  releaseVersion: Address,
  event: ethereum.Event,
): Asset {
  // Update registrations sorted by priority.
  let asset = getOrCreateAsset(assetAddress, releaseVersion, event);
  let registrations = arrayUnique<string>(asset.registrations.concat([registrationId]))
    .map<AssetRegistration>((id) => AssetRegistration.load(id) as AssetRegistration)
    .sort((a, b) => sortRegistrations(a, b));

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

function addProxyToAggregator(proxyAddress: Address, aggregatorAddress: Address, event: ethereum.Event): Aggregator {
  // Register the aggregator proxy with the aggregator entity.
  let aggregator = getUpdatedAggregator(aggregatorAddress, event);
  aggregator.proxies = arrayUnique<string>(aggregator.proxies.concat([proxyAddress.toHex()]));
  aggregator.save();

  return aggregator;
}

function removeRegistrationFromAsset(
  assetAddress: Address,
  registrationId: string,
  releaseVersion: Address,
  event: ethereum.Event,
): Asset {
  let asset = getOrCreateAsset(assetAddress, releaseVersion, event);
  let removed = arrayDiff<string>(asset.registrations, [registrationId]);
  let registrations = arrayUnique<string>(removed.concat([registrationId]))
    .map<AssetRegistration>((id) => AssetRegistration.load(id) as AssetRegistration)
    .sort((a, b) => sortRegistrations(a, b));

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

function primitiveRegistrationId(assetAddress: Address, releaseVersion: Address): string {
  return 'PRIMITIVE/' + assetAddress.toHex() + '/' + releaseVersion.toHex();
}

function derivativeRegistrationId(assetAddress: Address, releaseVersion: Address): string {
  return 'DERIVATIVE/' + assetAddress.toHex() + '/' + releaseVersion.toHex();
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

  static load(id: string): Registration | null {
    let entity = this.entity(id);
    if (entity == null) {
      return null;
    }

    return changetype<Registration | null>(store.get(entity!, id));
  }

  get id(): string {
    let value = this.get('id');
    return value!.toString();
  }

  set id(value: string) {
    this.set('id', Value.fromString(value));
  }

  get type(): string {
    let value = this.get('type');
    return value!.toString();
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

  static load(id: string): AssetRegistration | null {
    let entity = this.entity(id);
    if (entity == null) {
      return null;
    }

    return changetype<AssetRegistration | null>(store.get(entity!, id));
  }

  get id(): string {
    let value = this.get('id');
    return value!.toString();
  }

  set id(value: string) {
    this.set('id', Value.fromString(value));
  }

  get type(): string {
    let value = this.get('type');
    return value!.toString();
  }

  set type(value: string) {
    this.set('type', Value.fromString(value));
  }

  get asset(): string {
    let value = this.get('asset');
    return value!.toString();
  }

  set asset(value: string) {
    this.set('asset', Value.fromString(value));
  }

  get version(): Bytes {
    let value = this.get('version');
    return value!.toBytes();
  }

  set version(value: Bytes) {
    this.set('version', Value.fromBytes(value));
  }
}
