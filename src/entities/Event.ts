import { log } from '@graphprotocol/graph-ts';
import { Event, Fund } from '../generated/schema';
import { Context } from '../context';

export function createFundEvent(name: string, context: Context): Event {
  let event = context.event;
  let fund = context.entities.fund;
  let id = fund.id + '/' + event.transaction.hash.toHex() + '/' + event.logIndex.toString();
  return makeEvent(id, name, context, fund);
}

export function createEvent(name: string, context: Context): Event {
  let event = context.event;
  let version = context.entities.version;
  let id = version.id + '/' + event.transaction.hash.toHex() + '/' + event.logIndex.toString();
  return makeEvent(id, name, context);
}

function makeEvent(id: string, name: string, context: Context, fund: Fund | null = null): Event {
  let event = context.event;

  if (Event.load(id)) {
    log.critical('Duplicate event registration "{}" on contract {} in transaction {}.', [
      name,
      event.address.toHex(),
      event.transaction.hash.toHex(),
    ]);
  }

  let version = context.entities.version;
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
