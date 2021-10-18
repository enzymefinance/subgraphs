import { Address, ethereum } from '@graphprotocol/graph-ts';
import {
  PrimitiveRegistration,
  DerivativeRegistration,
  Version,
  Asset,
  RegistrationAdded,
  RegistrationRemoved,
} from '../generated/schema';
import { getRegistrationChangeCounter, getRegistrationCounter } from './Counter';

function registrationId(type: string, event: ethereum.Event): string {
  return type + '/' + event.transaction.hash.toHex() + '/' + event.logIndex.toString();
}

export function createDerivativeRegistration(
  version: Version,
  asset: Asset,
  feed: Address,
  event: ethereum.Event,
): void {
  let id = registrationId('DERIVATIVE', event);
  let registration = new DerivativeRegistration(id);
  registration.type = 'DERIVATIVE';
  registration.asset = asset.id;
  registration.version = version.id;
  registration.counter = getRegistrationCounter();
  registration.feed = feed;
  registration.save();

  asset.registration = registration.id;
  asset.save();

  let change = new RegistrationAdded(id + '/ADDED');
  change.registration = id;
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
  if (asset.registration && asset.registration!.startsWith('DERIVATIVE/')) {
    asset.registration = null;
    asset.save();
  }

  asset.registration = null;
  asset.save();

  let id = registrationId('DERIVATIVE', event);
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
  let id = registrationId('PRIMITIVE', event);
  let registration = new PrimitiveRegistration(id);
  registration.type = 'PRIMITIVE';
  registration.asset = asset.id;
  registration.version = version.id;
  registration.counter = getRegistrationCounter();
  registration.aggregator = aggregator;
  registration.save();

  asset.registration = registration.id;
  asset.save();

  let change = new RegistrationAdded(id + '/ADDED');
  change.registration = id;
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
  if (asset.registration && asset.registration!.startsWith('PRIMITIVE/')) {
    asset.registration = null;
    asset.save();
  }

  asset.registration = null;
  asset.save();

  let id = registrationId('PRIMITIVE', event);
  let change = new RegistrationRemoved(id + '/REMOVED');
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
