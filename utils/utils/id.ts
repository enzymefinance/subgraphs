import { ethereum } from '@graphprotocol/graph-ts';

export function uniqueEventId(event: ethereum.Event, suffix: string = ''): string {
  let txHash = event.transaction.hash.toHex();
  let logIndex = event.logIndex.toString();
  return txHash + '/' + logIndex + (suffix != '' ? '/' + suffix : '');
}

export function uniqueSortableEventId(event: ethereum.Event): string {
  let block = event.block.number.toString().padStart(16, '0');
  let txLogIndex = event.transaction.index.toString().padStart(8, '0');
  let logIndex = event.logIndex.toString().padStart(8, '0');
  return block + '/' + txLogIndex + '/' + logIndex;
}
