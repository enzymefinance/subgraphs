import { ethereum } from '@graphprotocol/graph-ts';

export function uniqueEventId(event: ethereum.Event): string {
  let txHash = event.transaction.hash.toHex();
  let logIndex = event.logIndex.toString();

  return txHash + '/' + logIndex;
}

export function uniqueSortableEventId(event: ethereum.Event): string {
  let block = event.block.number.toString().padStart(16);
  let logIndex = event.logIndex.toString().padStart(8);
  let txLogIndex = event.transactionLogIndex.toString().padStart(8);

  return block + '/' + txLogIndex + '/' + logIndex;
}
