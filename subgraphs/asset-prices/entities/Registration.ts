import { store, Address, Entity, Value, ethereum } from '@graphprotocol/graph-ts';
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
  registration.priority = 1000;
  registration.proxy = proxyAddress.toHex();
  registration.save();

  let aggregatorAddress = unwrapAggregator(proxyAddress);
  addRegistrationToAggregatorProxy(proxyAddress, registrationId);
  addProxyToAggregator(proxyAddress, aggregatorAddress);

  return registration;
}

export function createDerivativeRegistration(
  assetAddress: Address,
  issuerAddress: Address,
  valueInterpreterAddress: Address,
  registrationPriority: number,
): DerivativeRegistration {
  let registrationId = derivativeRegistrationId(assetAddress, issuerAddress);
  let registration = DerivativeRegistration.load(registrationId) as DerivativeRegistration;
  if (registration != null) {
    return registration;
  }

  registration = new DerivativeRegistration(registrationId);
  registration.type = 'DERIVATIVE';
  registration.issuer = issuerAddress.toHex();
  registration.asset = assetAddress.toHex();
  registration.priority = registrationPriority as i32;
  registration.interpreter = valueInterpreterAddress.toHex();
  registration.save();

  addRegistrationToAsset(assetAddress, registrationId);

  return registration;
}

export function createOrUpdatePrimitiveRegistration(
  assetAddress: Address,
  issuerAddress: Address,
  proxyAddress: Address,
  valueInterpreterAddress: Address,
  registrationPriority: number,
  quoteCurrency: string | null = null,
): PrimitiveRegistration {
  let previous = removePrimitiveRegistration(assetAddress, issuerAddress);

  let registrationId = primitiveRegistrationId(assetAddress, issuerAddress);
  let registration = new PrimitiveRegistration(registrationId);
  registration.type = 'PRIMITIVE';
  registration.quote = quoteCurrency == null ? (previous == null ? 'ETH' : previous.quote) : quoteCurrency;
  registration.issuer = issuerAddress.toHex();
  registration.asset = assetAddress.toHex();
  registration.proxy = proxyAddress.toHex();
  registration.priority = registrationPriority as i32;
  registration.interpreter = valueInterpreterAddress.toHex();
  registration.save();

  let aggregatorAddress = unwrapAggregator(proxyAddress);
  addRegistrationToAggregatorProxy(proxyAddress, registrationId);
  addProxyToAggregator(proxyAddress, aggregatorAddress);
  addRegistrationToAsset(assetAddress, registrationId);

  return registration;
}

export function removePrimitiveRegistration(
  assetAddress: Address,
  issuerAddress: Address,
): PrimitiveRegistration | null {
  let registrationId = primitiveRegistrationId(assetAddress, issuerAddress);
  let registration = PrimitiveRegistration.load(registrationId);
  if (registration == null) {
    return null;
  }

  // Delete the registration entity.
  store.remove('PrimitiveRegistration', registration.id);
  removeRegistrationFromAggregatorProxy(Address.fromString(registration.proxy), registrationId);
  removeRegistrationFromAsset(assetAddress, registrationId);

  return registration;
}

export function removeDerivativeRegistration(
  assetAddress: Address,
  issuerAddress: Address,
): DerivativeRegistration | null {
  let registrationId = primitiveRegistrationId(assetAddress, issuerAddress);
  let registration = DerivativeRegistration.load(registrationId);
  if (registration == null) {
    return null;
  }

  // Delete the registration entity.
  store.remove('DerivativeRegistration', registration.id);
  removeRegistrationFromAsset(assetAddress, registrationId);

  return registration;
}

export function getUpdatedAggregator(aggregatorAddress: Address, event: ethereum.Event): Aggregator {
  // Only check for aggregator updates once every 24 hours.
  let aggregator = getOrCreateAggregator(aggregatorAddress);
  if (aggregator.updated.plus(ONE_DAY).gt(event.block.timestamp)) {
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

  aggregator.updated = event.block.timestamp;
  aggregator.save();

  return aggregator;
}

export function getActiveRegistration(asset: Asset): Registration | null {
  let registrations = asset.registrations;
  let registration: Registration | null = registrations.length > 0 ? Registration.load(registrations[0]) : null;
  return registration;
}

function addRegistrationToAsset(assetAddress: Address, registrationId: string): Asset {
  // Update registrations sorted by priority.
  let asset = getOrCreateAsset(assetAddress);
  asset.registrations = arrayUnique<string>(asset.registrations.concat([registrationId]))
    .map<Registration>((id) => Registration.load(id) as Registration)
    .filter((registration) => registration != null)
    .sort((a, b) => b.priority - a.priority)
    .map<string>((registration) => registration.id);

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

function removeRegistrationFromAsset(assetAddress: Address, registrationId: string): Asset {
  let asset = getOrCreateAsset(assetAddress);
  asset.registrations = arrayDiff<string>(asset.registrations, [registrationId]);
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

function primitiveRegistrationId(assetAddress: Address, issuerAddress: Address): string {
  return 'PRIMITIVE/' + assetAddress.toHex() + '/' + issuerAddress.toHex();
}

function derivativeRegistrationId(assetAddress: Address, issuerAddress: Address): string {
  return 'DERIVATIVE/' + assetAddress.toHex() + '/' + issuerAddress.toHex();
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

  get priority(): i32 {
    let value = this.get('priority') as Value;
    return value.toI32();
  }

  set priority(value: i32) {
    this.set('priority', Value.fromI32(value));
  }
}
