import { ethereum, Address, log } from '@graphprotocol/graph-ts';
import { Event } from '../generated/schema';

export function eventId(event: ethereum.Event, version: Address | null = null): string {
  let id = event.transaction.hash.toHex() + '/' + event.logIndex.toString();
  if (version) {
    id = version.toHex() + '/' + id;
  }

  return id;
}

export function createRegistryEvent<TEvent extends ethereum.Event = ethereum.Event>(
  name: string,
  event: TEvent,
  version: Address,
  fund: Address | null = null,
): Event {
  return makeEvent(eventId(event, version), name, event, version, fund);
}

export function createEvent<TEvent extends ethereum.Event = ethereum.Event>(
  name: string,
  event: TEvent,
  version: Address,
  fund: Address | null = null,
): Event {
  return makeEvent(eventId(event), name, event, version, fund);
}

function makeEvent<TEvent extends ethereum.Event = ethereum.Event>(
  id: string,
  name: string,
  event: TEvent,
  version: Address,
  fund: Address | null = null,
): Event {
  if (Event.load(id)) {
    log.warning('Duplicate event', []);
    // throw new Error('Duplicate event registration.');
  }

  let entity = new Event(id);
  entity.name = name;
  entity.contract = event.address.toHex();
  entity.hash = event.transaction.hash.toHex();
  entity.from = event.transaction.from.toHex();
  entity.block = event.block.number;
  entity.timestamp = event.block.timestamp;
  entity.version = version.toHex();
  entity.fund = fund ? fund.toHex() : null;

  entity.save();

  return entity;
}
