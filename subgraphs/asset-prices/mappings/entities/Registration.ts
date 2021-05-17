import { arrayUnique, arrayDiff } from '@enzymefinance/subgraph-utils';
import { store, Address, Entity, Value } from '@graphprotocol/graph-ts';
import {
  PrimitiveRegistration,
  DerivativeRegistration,
  CurrencyRegistration,
  Aggregator,
  AggregatorProxy,
} from '../../generated/schema';
import { unwrapAggregator } from '../utils/unwrapAggregator';
import { getOrCreateAggregatorProxy, getOrCreateAggregator } from './Aggregator';
import { getOrCreateAsset } from './Asset';

export function createCurrencyRegistration(currency: string, proxyAddress: Address): Aggregator {
  let registrationId = currencyRegistrationId(currency);
  let registration = new CurrencyRegistration(registrationId);
  registration.type = 'CURRENCY';
  registration.currency = currency;
  registration.proxy = proxyAddress.toHex();
  registration.save();

  let aggregatorAddress = unwrapAggregator(proxyAddress);
  addRegistrationToAggregatorProxy(proxyAddress, registrationId);
  return addProxyToAggregator(proxyAddress, aggregatorAddress);
}

export function createOrUpdatePrimitiveRegistration(
  assetAddress: Address,
  issuerAddress: Address,
  proxyAddress: Address,
): void {
  let registrationId = primitiveRegistrationId(assetAddress, issuerAddress);
  let registration = new PrimitiveRegistration(registrationId);
  registration.type = 'PRIMITIVE';
  registration.issuer = issuerAddress.toHex();
  registration.asset = assetAddress.toHex();
  registration.proxy = proxyAddress.toHex();
  registration.save();

  let aggregatorAddress = unwrapAggregator(proxyAddress);
  addRegistrationToAsset(assetAddress, registrationId);
  addRegistrationToAggregatorProxy(proxyAddress, registrationId);
  addProxyToAggregator(proxyAddress, aggregatorAddress);
}

export function removePrimitiveRegistration(assetAddress: Address, issuerAddress: Address): void {
  let registrationId = primitiveRegistrationId(assetAddress, issuerAddress);
  let registration = PrimitiveRegistration.load(registrationId);
  if (registration == null) {
    return;
  }

  // Delete the registration entity.
  Registration.remove(registration.id);
  removeRegistrationFromAsset(assetAddress, registrationId);
  removeRegistrationFromAggregator(Address.fromString(registration.proxy), registrationId);
}

export function createOrUpdateDerivativeRegistration(assetAddress: Address, issuerAddress: Address): void {
  let registrationId = derivativeRegistrationId(assetAddress, issuerAddress);
  let registration = new DerivativeRegistration(registrationId);
  registration.type = 'DERIVATIVE';
  registration.issuer = issuerAddress.toHex();
  registration.asset = assetAddress.toHex();
  registration.save();

  addRegistrationToAsset(assetAddress, registrationId);
}

export function removeDerivativeRegistration(assetAddress: Address, issuerAddress: Address): void {
  let registrationId = derivativeRegistrationId(assetAddress, issuerAddress);
  let registration = PrimitiveRegistration.load(registrationId);
  if (registration == null) {
    return;
  }

  // Delete the registration entity.
  Registration.remove(registration.id);
  removeRegistrationFromAsset(assetAddress, registrationId);
}

export function getUpdatedAggregator(aggregatorAddress: Address): Aggregator {
  let aggregator = getOrCreateAggregator(aggregatorAddress);
  let proxies = aggregator.proxies.map<AggregatorProxy>((id) => getOrCreateAggregatorProxy(Address.fromString(id)));

  for (let i: i32 = 0; i < proxies.length; i++) {
    let proxy = proxies[i];
    let address = Address.fromString(proxy.id);
    let unwrapped = unwrapAggregator(address);

    // Check if the proxy has been pointed at a new aggregator.
    if (unwrapped.notEqual(aggregatorAddress)) {
      // Spawn the new aggregator.
      addProxyToAggregator(address, unwrapped);

      // Remove the reference on the old aggregator.
      aggregator.proxies = arrayDiff<string>(aggregator.proxies, [aggregatorAddress.toHex()]);
      aggregator.save();
    }
  }

  return aggregator;
}

function addRegistrationToAsset(assetAddress: Address, registrationId: string): void {
  // Register the registration entity with the asset.
  let asset = getOrCreateAsset(assetAddress);
  asset.registrations = arrayUnique<string>(asset.registrations.concat([registrationId]));
  asset.save();
}

function removeRegistrationFromAsset(assetAddress: Address, registrationId: string): void {
  // Deregister the registration entity from the asset entity.
  let asset = getOrCreateAsset(assetAddress);
  asset.registrations = arrayDiff<string>(asset.registrations, [registrationId]);
  asset.save();
}

function addRegistrationToAggregatorProxy(proxyAddress: Address, registrationId: string): void {
  // Register the registration entity with the aggregator proxy entity.
  let proxy = getOrCreateAggregatorProxy(proxyAddress);
  proxy.registrations = proxy.registrations.concat([registrationId]);
  proxy.save();
}

function addProxyToAggregator(proxyAddress: Address, aggregatorAddress: Address): Aggregator {
  // Register the aggregator proxy with the aggregator entity.
  let aggregator = getOrCreateAggregator(aggregatorAddress);
  aggregator.proxies = arrayUnique<string>(aggregator.proxies.concat([proxyAddress.toHex()]));
  aggregator.save();

  return aggregator;
}

function removeRegistrationFromAggregator(proxyAddress: Address, registrationId: string): void {
  // Deregister the registration entity from the aggregator proxy entity.
  let proxy = getOrCreateAggregatorProxy(proxyAddress);
  proxy.registrations = arrayDiff<string>(proxy.registrations, [registrationId]);
  proxy.save();
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
}
