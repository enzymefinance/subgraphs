import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts';
import { Account } from '../generated/schema';
import { logCritical } from '../utils/logCritical';

export function ensureManager(managerAddress: Address, event: ethereum.Event): Account {
  let account = ensureAccount(managerAddress, event);

  if (!account.manager) {
    account.manager = true;
    account.save();
  }

  return account;
}

export function ensureInvestor(investorAddress: Address, event: ethereum.Event): Account {
  let account = ensureAccount(investorAddress, event);

  if (!account.investor) {
    account.investor = true;
    account.save();
  }

  return account;
}

export function useAccount(id: string): Account {
  let account = Account.load(id);
  if (account == null) {
    logCritical('Failed to load account {}.', [id]);
  }

  return account as Account;
}

export function ensureAccount(accountAddress: Address, event: ethereum.Event): Account {
  let account = Account.load(accountAddress.toHex()) as Account;
  if (account) {
    return account;
  }

  account = new Account(accountAddress.toHex());
  account.firstSeen = event.block.timestamp;
  account.manager = false;
  account.investor = false;
  account.save();

  return account;
}
