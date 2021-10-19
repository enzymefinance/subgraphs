import { arrayUnique } from '@enzymefinance/subgraph-utils';
import { Address, Entity, ethereum } from '@graphprotocol/graph-ts';
import {
  Asset,
  DerivativeRegistrationDetails,
  PrimitiveRegistrationDetails,
  Registration,
  RegistrationChange,
  Version,
} from '../generated/schema';
import { getRegistrationChangeCounter, getRegistrationCounter } from './Counter';

function registrationId(version: Version, asset: Asset): string {
  return version.id + '/' + asset.id;
}

export function getOrCreateRegistration(version: Version, asset: Asset): Registration {
  let id = registrationId(version, asset);
  let registration = Registration.load(id);

  if (registration == null) {
    registration = new Registration(id);
    registration.asset = asset.id;
    registration.version = version.id;
    registration.counter = getRegistrationCounter();
    registration.active = false;
    registration.details = '';
    registration.save();
  }

  return registration;
}

function registrationDetailsId(version: Version, asset: Asset, event: ethereum.Event): string {
  return version.id + '/' + asset.id + '/' + event.transaction.hash.toHex() + '/' + event.logIndex.toString();
}

export function getOrCreateDerivativeRegistrationDetails(
  version: Version,
  asset: Asset,
  feed: Address,
  event: ethereum.Event,
): DerivativeRegistrationDetails {
  let id = registrationDetailsId(version, asset, event);
  let details = DerivativeRegistrationDetails.load(id);

  if (details == null) {
    details = new DerivativeRegistrationDetails(id);
    details.feed = feed;
    details.save();
  }

  return details;
}

export function getOrCreatePrimitiveRegistrationDetails(
  version: Version,
  asset: Asset,
  aggregator: Address,
  event: ethereum.Event,
): PrimitiveRegistrationDetails {
  let id = registrationDetailsId(version, asset, event);
  let details = PrimitiveRegistrationDetails.load(id);

  if (details == null) {
    details = new PrimitiveRegistrationDetails(id);
    details.aggregator = aggregator;
    details.save();
  }

  return details;
}

function registrationChangeId(registration: Registration, change: string, event: ethereum.Event): string {
  return registration.id + '/' + change + '/' + event.transaction.hash.toHex() + '/' + event.logIndex.toString();
}

export function recordRegistrationChange(
  version: Version,
  asset: Asset,
  registration: Registration,
  details: string,
  change: string,
  event: ethereum.Event,
): void {
  let id = registrationChangeId(registration, change, event);
  let record = new RegistrationChange(id);
  record.registration = registration.id;
  record.details = details;
  record.change = change;
  record.version = version.id;
  record.asset = asset.id;
  record.timestamp = event.block.timestamp.toI32();
  record.block = event.block.number;
  record.transaction = event.transaction.hash;
  record.counter = getRegistrationChangeCounter();
  record.save();
}

export function createDerivativeRegistration(
  version: Version,
  asset: Asset,
  feed: Address,
  event: ethereum.Event,
): void {
  let registration = getOrCreateRegistration(version, asset);
  let details = getOrCreateDerivativeRegistrationDetails(version, asset, feed, event);
  registration.active = true;
  registration.details = details.id;
  registration.save();

  asset.registrations = arrayUnique<string>(asset.registrations.concat([registration.id]));
  asset.save();

  // Record the change with the new details.
  recordRegistrationChange(version, asset, registration, details.id, 'ADDED', event);
}

export function removeDerivativeRegistration(version: Version, asset: Asset, event: ethereum.Event): void {
  let registration = getOrCreateRegistration(version, asset);
  registration.active = false;
  registration.save();

  // Record the change with the last known details.
  recordRegistrationChange(version, asset, registration, registration.details, 'REMOVED', event);
}

export function createPrimitiveRegistration(
  version: Version,
  asset: Asset,
  aggregator: Address,
  event: ethereum.Event,
): void {
  let registration = getOrCreateRegistration(version, asset);
  let details = getOrCreatePrimitiveRegistrationDetails(version, asset, aggregator, event);
  registration.active = true;
  registration.details = details.id;
  registration.save();

  asset.registrations = arrayUnique<string>(asset.registrations.concat([registration.id]));
  asset.save();

  // Record the change with the new details.
  recordRegistrationChange(version, asset, registration, details.id, 'ADDED', event);
}

export function removePrimitiveRegistration(version: Version, asset: Asset, event: ethereum.Event): void {
  let registration = getOrCreateRegistration(version, asset);
  registration.active = false;
  registration.save();

  // Record the change with the last known details.
  recordRegistrationChange(version, asset, registration, registration.details, 'REMOVED', event);
}
