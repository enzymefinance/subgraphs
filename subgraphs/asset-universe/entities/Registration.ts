import { arrayUnique } from '@enzymefinance/subgraph-utils';
import { ethereum } from '@graphprotocol/graph-ts';
import { Asset, Registration, Release } from '../generated/schema';
import { getRegistrationCounter } from './Counter';
import { recordRegistrationChange } from './RegistrationChange';

function registrationId(release: Release, asset: Asset): string {
  return release.id + '/' + asset.id;
}

export function getOrCreateRegistration(release: Release, asset: Asset, event: ethereum.Event): Registration {
  let id = registrationId(release, asset);
  let registration = Registration.load(id);

  if (registration == null) {
    registration = new Registration(id);
    registration.asset = asset.id;
    registration.release = release.id;
    registration.releaseCounter = release.counter;
    registration.counter = getRegistrationCounter();
    registration.added = event.block.timestamp.toI32();
    registration.updated = event.block.timestamp.toI32();
    registration.active = false;
    registration.save();
  }

  return registration;
}

export function createDerivativeRegistration(release: Release, asset: Asset, event: ethereum.Event): void {
  let registration = getOrCreateRegistration(release, asset, event);
  registration.active = true;
  registration.updated = event.block.timestamp.toI32();
  registration.save();

  asset.registrations = arrayUnique<string>(asset.registrations.concat([registration.id]));
  asset.save();

  // Record the change.
  recordRegistrationChange(release, asset, registration, 'ADDED', event);
}

export function removeDerivativeRegistration(release: Release, asset: Asset, event: ethereum.Event): void {
  let registration = getOrCreateRegistration(release, asset, event);
  registration.active = false;
  registration.updated = event.block.timestamp.toI32();
  registration.save();

  // Record the change.
  recordRegistrationChange(release, asset, registration, 'REMOVED', event);
}

export function createPrimitiveRegistration(release: Release, asset: Asset, event: ethereum.Event): void {
  let registration = getOrCreateRegistration(release, asset, event);
  registration.active = true;
  registration.updated = event.block.timestamp.toI32();
  registration.save();

  asset.registrations = arrayUnique<string>(asset.registrations.concat([registration.id]));
  asset.save();

  // Record the change.
  recordRegistrationChange(release, asset, registration, 'ADDED', event);
}

export function removePrimitiveRegistration(release: Release, asset: Asset, event: ethereum.Event): void {
  let registration = getOrCreateRegistration(release, asset, event);
  registration.active = false;
  registration.updated = event.block.timestamp.toI32();
  registration.save();

  // Record the change with.
  recordRegistrationChange(release, asset, registration, 'REMOVED', event);
}
