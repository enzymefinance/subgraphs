import { ethereum } from '@graphprotocol/graph-ts';
import { Transaction } from '../generated/schema';
import { toBigDecimal } from '../utils/toBigDecimal';

export function transactionId(tx: ethereum.Transaction): string {
  return tx.hash.toHex();
}

export function ensureTransaction(event: ethereum.Event): Transaction {
  let id = transactionId(event.transaction);
  let transaction = Transaction.load(id) as Transaction;
  if (transaction) {
    return transaction;
  }

  transaction = new Transaction(id);
  transaction.from = event.transaction.from.toHex();
  transaction.to = event.transaction.to ? event.transaction.to.toHex() : null;
  transaction.value = toBigDecimal(event.transaction.value);
  transaction.block = event.block.number;
  transaction.timestamp = event.block.timestamp;
  transaction.gasUsed = event.transaction.gasUsed.toI32();
  transaction.gasPrice = toBigDecimal(event.transaction.gasPrice);
  transaction.input = event.transaction.input.toHex();
  transaction.save();

  return transaction;
}
