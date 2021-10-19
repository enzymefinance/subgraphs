import { arrayDiff, arrayUnique } from '@enzymefinance/subgraph-utils';
import { Address, ethereum } from '@graphprotocol/graph-ts';
import {
  Asset,
  DerivativeRegistrationDetails,
  PrimitiveRegistrationDetails,
  Registration,
  RegistrationAdded,
  RegistrationRemoved,
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

function registrationDetailsId(registration: Registration, type: string): string {
  return registration.id + '/' + type;
}

export function getOrCreateDerivativeRegistrationDetails(
  registration: Registration,
  feed: Address,
): DerivativeRegistrationDetails {
  let id = registrationDetailsId(registration, 'DERIVATIVE');

  let details = DerivativeRegistrationDetails.load(registration.id);

  if (details == null) {
    details = new DerivativeRegistrationDetails(id);
    details.registration = registration.id;
    details.feed = feed;
    details.save();
  }

  return details;
}

export function getOrCreatePrimitiveRegistrationDetails(
  registration: Registration,
  aggregator: Address,
): PrimitiveRegistrationDetails {
  let id = registrationDetailsId(registration, 'PRIMITIVE');

  let details = PrimitiveRegistrationDetails.load(registration.id);

  if (details == null) {
    details = new PrimitiveRegistrationDetails(id);
    details.registration = registration.id;
    details.aggregator = aggregator;
    details.save();
  }

  return details;
}

export function createDerivativeRegistration(
  version: Version,
  asset: Asset,
  feed: Address,
  event: ethereum.Event,
): void {
  let registration = getOrCreateRegistration(version, asset);
  let details = getOrCreateDerivativeRegistrationDetails(registration, feed);

  registration.active = true;
  registration.details = details.id;
  registration.save();

  asset.registrations = arrayUnique<string>(asset.registrations.concat([registration.id]));
  asset.save();

  let change = new RegistrationAdded(registration.id + '/ADDED' + '/' + event.block.timestamp.toString());
  change.registration = registration.id;
  change.type = 'DERIVATIVE';
  change.change = 'ADDED';
  change.version = version.id;
  change.asset = asset.id;
  change.timestamp = event.block.timestamp.toI32();
  change.block = event.block.number;
  change.transaction = event.transaction.hash;
  change.counter = getRegistrationChangeCounter();
  change.save();
}

export function removeDerivativeRegistration(version: Version, asset: Asset, event: ethereum.Event): void {
  let registration = getOrCreateRegistration(version, asset);

  registration.active = false;
  registration.save();

  asset.registrations = arrayDiff<string>(asset.registrations, [registration.id]);
  asset.save();

  let id = registrationId(version, asset);
  let change = new RegistrationRemoved(id + '/REMOVED');
  change.type = 'DERIVATIVE';
  change.change = 'REMOVED';
  change.version = version.id;
  change.asset = asset.id;
  change.timestamp = event.block.timestamp.toI32();
  change.block = event.block.number;
  change.transaction = event.transaction.hash;
  change.counter = getRegistrationChangeCounter();
  change.save();
}

export function createPrimitiveRegistration(
  version: Version,
  asset: Asset,
  aggregator: Address,
  event: ethereum.Event,
): void {
  let registration = getOrCreateRegistration(version, asset);
  let details = getOrCreateDerivativeRegistrationDetails(registration, aggregator);

  registration.active = true;
  registration.details = details.id;
  registration.save();

  asset.registrations = arrayUnique<string>(asset.registrations.concat([registration.id]));
  asset.save();

  let change = new RegistrationAdded(registration.id + '/ADDED' + '/' + event.block.timestamp.toString());
  change.registration = registration.id;
  change.type = 'PRIMITIVE';
  change.change = 'ADDED';
  change.version = version.id;
  change.asset = asset.id;
  change.timestamp = event.block.timestamp.toI32();
  change.block = event.block.number;
  change.transaction = event.transaction.hash;
  change.counter = getRegistrationChangeCounter();
  change.save();
}

export function removePrimitiveRegistration(version: Version, asset: Asset, event: ethereum.Event): void {
  let registration = getOrCreateRegistration(version, asset);
  registration.active = false;
  registration.save();

  asset.registrations = arrayDiff<string>(asset.registrations, [registration.id]);
  asset.save();

  let change = new RegistrationRemoved(registration.id + '/REMOVED' + '/' + event.block.timestamp.toString());
  change.type = 'PRIMITIVE';
  change.change = 'REMOVED';
  change.version = version.id;
  change.asset = asset.id;
  change.timestamp = event.block.timestamp.toI32();
  change.block = event.block.number;
  change.transaction = event.transaction.hash;
  change.counter = getRegistrationChangeCounter();
  change.save();
}
