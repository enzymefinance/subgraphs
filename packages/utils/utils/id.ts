import { BigInt, ethereum } from '@graphprotocol/graph-ts';
import { logCritical } from './logging';

export function uniqueEventId(event: ethereum.Event, suffix: string = ''): string {
  let txHash = event.transaction.hash.toHex();
  let logIndex = event.logIndex.toString();
  return txHash + '/' + logIndex + (suffix != '' ? '/' + suffix : '');
}

export function previousUniqueEventId(event: ethereum.Event, suffix: string = ''): string {
  let txHash = event.transaction.hash.toHex();

  if (event.logIndex.equals(BigInt.fromI32(0))) {
    logCritical('No previous event id to event with id {}', [uniqueEventId(event, suffix)]);
  }

  let logIndex = event.logIndex.minus(BigInt.fromI32(1)).toString();
  return txHash + '/' + logIndex + (suffix != '' ? '/' + suffix : '');
}

export function uniqueSortableEventId(event: ethereum.Event): string {
  let block = event.block.number.toString().padStart(16, '0');
  let txLogIndex = event.transaction.index.toString().padStart(8, '0');
  let logIndex = event.logIndex.toString().padStart(8, '0');
  return block + '/' + txLogIndex + '/' + logIndex;
}
