import { ZERO_BD, toBigDecimal, ZERO_ADDRESS } from '@enzymefinance/subgraph-utils';
import { Address, BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts';
import { Transfer as TransferEvent } from '../generated/contracts/TokenEvents';
import { Account, Balance, Transfer } from '../generated/schema';

// When the new token contract was deployed, the migration contract got minted a tranch of 932613000000000000000000 tokens. It is
// unclear how this value came to be but as a matter of fact this is now the total sum of all tokens that can ever be migrated over
// from the old contract. Hence, we can consider the difference of the total supply of the old token and this value as the amount
// of tokens that were burned at this point.
//
// Hence, 1250000000000000000000000 - 932613000000000000000000 = 317387000000000000000000 ...
//
// # Some other notes:
//
// ## Old token
//
// Address: https://etherscan.io/address/0xbeb9ef514a379b997e0798fdcc901ee474b6d9a1
// Deployment: https://etherscan.io/tx/0x024ee6228b799a5ce93ccc94a8e3b657e960ae53222fd45e250b2984905f3e2
// Burn: https://etherscan.io/tx/0x7dbf771925bec2489f398a98f3156da4d0b19cdf55e6da57cb8701617f3fd45d
//
// Supply: 1250000000000000000000000
// Burned: 248011981318720000000000 at block 7130390
//
// ## New token
//
// Address: https://etherscan.io/address/0xec67005c4E498Ec7f55E092bd1d35cbC47C91892
// Deployment: https://etherscan.io/tx/0xaffb53cd29ea4ea81b9131d43cc2a02ae5d6f0268d92336daa5c672084f53ec5
// Minting: https://etherscan.io/tx/0xd8d5a28a698a5748f4785df2627a777a6cd590e956cb98d0d2b4fcf084bc1a85
//
// Minted: 932613000000000000000000 at block 7130390
//
// ## Token migration contract
//
// Address: https://etherscan.io/address/0x3c75d37b579e0e4896f02c0122baa4de05383a6a
// Deployment: https://etherscan.io/tx/0x5ab5e0d8e7a8b22b69346bedc71086ac6d32fee0b78560d9dba8859ec8db50f2

function getLogOrdinal(event: ethereum.Event, suffix: i32): BigInt {
  let block = event.block.number;
  let index = BigInt.fromI32(1000000).plus(event.logIndex);
  return BigInt.fromString(block.toString() + index.toString() + suffix.toString());
}

function recordBalance(account: Account, event: ethereum.Event, suffix: i32): void {
  let ordinal = getLogOrdinal(event, suffix);
  let balance = new Balance(account.id.concat(Bytes.fromByteArray(Bytes.fromBigInt(ordinal))));
  balance.block = event.block.number;
  balance.account = account.id;
  balance.timestamp = event.block.timestamp;
  balance.balance = account.balance;
  balance.ordinal = ordinal;
  balance.save();
}

export function getOrCreateAccount(address: Address, event: ethereum.Event): Account {
  let account = Account.load(address);

  if (account == null) {
    account = new Account(address);
    account.balance = ZERO_BD;
    account.save();

    if (address.equals(ZERO_ADDRESS)) {
      // NOTE: This is the balance of the zero address at block 15056726 which we use as a start block to track
      // burn events on the old token contract.
      account.balance = toBigDecimal(BigInt.fromString('317387000000000000000000'), 18);
      account.save();

      recordBalance(account, event, 0);
    }
  }

  return account;
}

function getTransferType(from: Address, to: Address): string {
  return from.equals(ZERO_ADDRESS) ? 'MINT' : to.equals(ZERO_ADDRESS) ? 'BURN' : 'TRANSFER';
}

export function handleTransfer(event: TransferEvent): void {
  if (event.params.from.equals(event.params.to)) {
    return;
  }

  let transfer = new Transfer(event.transaction.hash.concat(Bytes.fromByteArray(Bytes.fromBigInt(event.logIndex))));
  transfer.block = event.block.number;
  transfer.timestamp = event.block.timestamp;
  transfer.transaction = event.transaction.hash;
  transfer.from = event.params.from;
  transfer.to = event.params.to;
  transfer.amount = toBigDecimal(event.params.value, 18);
  transfer.type = getTransferType(event.params.from, event.params.to);
  transfer.save();

  let toAccount = getOrCreateAccount(event.params.to, event);
  let fromAccount = getOrCreateAccount(event.params.from, event);

  toAccount.balance = toAccount.balance.plus(transfer.amount);
  toAccount.save();

  recordBalance(toAccount, event, 1);

  // Do not deduct the balance from the zero address in case of a token mint so we can use this
  // balance to track the total amount of burned tokens.
  if (transfer.type != 'MINT') {
    fromAccount.balance = fromAccount.balance.minus(transfer.amount);
    fromAccount.save();

    recordBalance(fromAccount, event, 2);
  }
}
