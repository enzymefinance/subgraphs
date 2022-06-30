import { ZERO_BD, toBigDecimal, ZERO_ADDRESS } from '@enzymefinance/subgraph-utils';
import { Address, Bytes } from '@graphprotocol/graph-ts';
import { Transfer as TransferEvent } from '../generated/contracts/TokenEvents';
import { Account, Transfer } from '../generated/schema';

export function getOrCreateAccount(address: Address): Account {
  let account = Account.load(address);

  if (account == null) {
    account = new Account(address);
    account.balance = ZERO_BD;
    account.save();
  }

  return account;
}

export function handleTransfer(event: TransferEvent): void {
  if (event.params.to.equals(ZERO_ADDRESS) && event.params.from.equals(ZERO_ADDRESS)) {
    return;
  }

  let transfer = new Transfer(event.transaction.hash.concat(Bytes.fromByteArray(Bytes.fromBigInt(event.logIndex))));
  transfer.block = event.block.number;
  transfer.timestamp = event.block.timestamp;
  transfer.transaction = event.transaction.hash;
  transfer.from = event.params.from;
  transfer.to = event.params.to;
  transfer.amount = toBigDecimal(event.params.value, 18);

  let to = getOrCreateAccount(event.params.to);
  let from = getOrCreateAccount(event.params.from);

  if (event.params.from.equals(ZERO_ADDRESS)) {
    transfer.type = 'MINT';
    transfer.save();

    // When minting, the tokens are not actually transferred from the zero address, hence we don't want to reduce its balance in this case.
    to.balance = to.balance.plus(transfer.amount);
    to.save();
  } else {
    transfer.type = event.params.to.equals(ZERO_ADDRESS) ? 'BURN' : 'TRANSFER';
    transfer.save();

    // We want to use the account at the zero address to record the total amount of tokens burned. Hence we do not make a difference here.
    to.balance = to.balance.plus(transfer.amount);
    to.save();

    from.balance = from.balance.minus(transfer.amount);
    from.save();
  }

  // TODO: Record balance history.
}
