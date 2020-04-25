import { Entity, ethereum, log } from '@graphprotocol/graph-ts';
import { Event, Fund, Version } from '../generated/schema';
import { Context } from '../context';

export function createFundEvent<TEvent extends ethereum.Event = ethereum.Event>(
  name: string,
  event: TEvent,
  context: Context,
): Event {
  let fund = context.entities.fund;
  return makeEvent(eventId(event, fund), name, event, context.entities.version, fund);
}

export function createEvent<TEvent extends ethereum.Event = ethereum.Event>(
  name: string,
  event: TEvent,
  context: Context,
): Event {
  let version = context.entities.version;
  return makeEvent(eventId(event, version), name, event, version);
}

function eventId(event: ethereum.Event, scope: Entity): string {
  return scope.getString('id') + '/' + event.transaction.hash.toHex() + '/' + event.logIndex.toString();
}

function makeEvent<TEvent extends ethereum.Event = ethereum.Event>(
  id: string,
  name: string,
  event: TEvent,
  version: Version,
  fund: Fund | null = null,
): Event {
  if (Event.load(id)) {
    log.critical('Duplicate event registration "{}" on contract {} in transaction {}.', [
      name,
      event.address.toHex(),
      event.transaction.hash.toHex(),
    ]);
  }

  let entity = new Event(id);
  entity.name = name;
  entity.contract = event.address.toHex();
  entity.hash = event.transaction.hash.toHex();
  entity.from = event.transaction.from.toHex();
  entity.block = event.block.number;
  entity.timestamp = event.block.timestamp;
  entity.version = version.id;
  entity.fund = fund ? fund.id : null;
  entity.save();

  return entity;
}
