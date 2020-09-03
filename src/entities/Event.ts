import { ethereum } from '@graphprotocol/graph-ts';

import { ContractEvent } from '../generated/schema';
import { logCritical } from '../utils/logCritical';

export function contractEventId(event: ethereum.Event): string {
  return event.transaction.hash.toHex() + '/' + event.logIndex.toString();
}

export function createContractEvent(
  name: string,
  event: ethereum.Event,
): ContractEvent {
  let id = contractEventId(event);

  if (ContractEvent.load(id)) {
    logCritical(
      'Duplicate event registration "{}" on contract {} in transaction {}.',
      [name, event.address.toHex(), event.transaction.hash.toHex()],
    );
  }

  let entity = new ContractEvent(id);
  entity.name = name;
  entity.contract = event.address.toHex();
  entity.transaction = event.transaction.hash.toHex();
  entity.from = event.transaction.from.toHex();
  entity.block = event.block.number;
  entity.timestamp = event.block.timestamp;
  entity.save();

  return entity;
}
