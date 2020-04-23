import { ethereum, Address } from '@graphprotocol/graph-ts';
import { Event } from '../../generated/schema';
import { HubContract } from '../../generated/templates/v2/HubContract/HubContract';

export function trackFundEvent<TEvent extends ethereum.Event = ethereum.Event>(
  name: string,
  event: TEvent,
  fundAddress: Address,
): Event {
  let hubContract = HubContract.bind(fundAddress);
  let versionAddress = hubContract.version();
  return makeEvent(eventId(event, fundAddress), name, event, versionAddress, fundAddress);
}

export function trackVersionEvent<TEvent extends ethereum.Event = ethereum.Event>(
  name: string,
  event: TEvent,
  versionAddress: Address,
): Event {
  return makeEvent(eventId(event, versionAddress), name, event, versionAddress);
}

function eventId(event: ethereum.Event, scope: Address): string {
  return scope.toHex() + '/' + event.transaction.hash.toHex() + '/' + event.logIndex.toString();
}

function makeEvent<TEvent extends ethereum.Event = ethereum.Event>(
  id: string,
  name: string,
  event: TEvent,
  versionAddress: Address,
  fundAddress: Address | null = null,
): Event {
  if (Event.load(id)) {
    throw new Error('Duplicate event registration.');
  }

  let entity = new Event(id);
  entity.name = name;
  entity.contract = event.address.toHex();
  entity.hash = event.transaction.hash.toHex();
  entity.from = event.transaction.from.toHex();
  entity.block = event.block.number;
  entity.timestamp = event.block.timestamp;
  entity.version = versionAddress.toHex();
  entity.fund = fundAddress ? fundAddress.toHex() : null;
  entity.save();

  return entity;
}
