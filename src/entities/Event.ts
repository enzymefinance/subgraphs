import { ContractEvent } from '../generated/schema';
import { Context } from '../context';
import { logCritical } from '../utils/logCritical';

export function contractEventId(context: Context): string {
  let event = context.event;
  let version = context.entities.version;
  return version.id + '/' + event.transaction.hash.toHex() + '/' + event.logIndex.toString();
}

export function createContractEvent(name: string, context: Context): ContractEvent {
  let event = context.event;
  let id = contractEventId(context);

  if (ContractEvent.load(id)) {
    logCritical('Duplicate event registration "{}" on contract {} in transaction {}.', [
      name,
      event.address.toHex(),
      event.transaction.hash.toHex(),
    ]);
  }

  let version = context.entities.version;
  let entity = new ContractEvent(id);
  entity.name = name;
  entity.contract = event.address.toHex();
  entity.transaction = event.transaction.hash.toHex();
  entity.from = event.transaction.from.toHex();
  entity.block = event.block.number;
  entity.timestamp = event.block.timestamp;
  entity.version = version.id;
  entity.fund = context.isSet('fund') ? context.getString('fund') : null;
  entity.save();

  return entity;
}
