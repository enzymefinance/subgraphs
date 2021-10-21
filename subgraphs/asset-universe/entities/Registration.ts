import { arrayUnique } from '@enzymefinance/subgraph-utils';
import { Address, ethereum } from '@graphprotocol/graph-ts';
import { Asset, Registration, Version } from '../generated/schema';
import { getRegistrationCounter } from './Counter';
import { recordRegistrationChange } from './RegistrationChange';
import { getOrCreateDerivativeRegistrationDetail, getOrCreatePrimitiveRegistrationDetail } from './RegistrationDetail';

function registrationId(version: Version, asset: Asset): string {
  return version.id + '/' + asset.id;
}

export function getOrCreateRegistration(version: Version, asset: Asset, event: ethereum.Event): Registration {
  let id = registrationId(version, asset);
  let registration = Registration.load(id);

  if (registration == null) {
    registration = new Registration(id);
    registration.asset = asset.id;
    registration.version = version.id;
    registration.counter = getRegistrationCounter();
    registration.added = event.block.timestamp.toI32();
    registration.updated = event.block.timestamp.toI32();
    registration.active = false;
    registration.detail = '';
    registration.save();
  }

  return registration;
}

export function createDerivativeRegistration(
  version: Version,
  asset: Asset,
  feed: Address,
  event: ethereum.Event,
): void {
  let registration = getOrCreateRegistration(version, asset, event);
  let registrationDetailId = getOrCreateDerivativeRegistrationDetail(version, asset, feed, event);
  registration.active = true;
  registration.detail = registrationDetailId;
  registration.updated = event.block.timestamp.toI32();
  registration.save();

  asset.registrations = arrayUnique<string>(asset.registrations.concat([registration.id]));
  asset.save();

  // Record the change with the new details.
  recordRegistrationChange(version, asset, registration, registrationDetailId, 'ADDED', event);
}

export function removeDerivativeRegistration(version: Version, asset: Asset, event: ethereum.Event): void {
  let registration = getOrCreateRegistration(version, asset, event);
  registration.active = false;
  registration.updated = event.block.timestamp.toI32();
  registration.save();

  // Record the change with the last known details.
  recordRegistrationChange(version, asset, registration, registration.detail, 'REMOVED', event);
}

export function createPrimitiveRegistration(
  version: Version,
  asset: Asset,
  aggregator: Address,
  event: ethereum.Event,
): void {
  let registration = getOrCreateRegistration(version, asset, event);
  let registrationDetailId = getOrCreatePrimitiveRegistrationDetail(version, asset, aggregator, event);
  registration.active = true;
  registration.detail = registrationDetailId;
  registration.updated = event.block.timestamp.toI32();
  registration.save();

  asset.registrations = arrayUnique<string>(asset.registrations.concat([registration.id]));
  asset.save();

  // Record the change with the new details.
  recordRegistrationChange(version, asset, registration, registrationDetailId, 'ADDED', event);
}

export function removePrimitiveRegistration(version: Version, asset: Asset, event: ethereum.Event): void {
  let registration = getOrCreateRegistration(version, asset, event);
  registration.active = false;
  registration.updated = event.block.timestamp.toI32();
  registration.save();

  // Record the change with the last known details.
  recordRegistrationChange(version, asset, registration, registration.detail, 'REMOVED', event);
}
