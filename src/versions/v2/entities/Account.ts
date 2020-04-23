import { Address } from '@graphprotocol/graph-ts';
import { Account } from '../generated/schema';

export function ensureManager(managerAddress: Address): Account {
  let account = ensureAccount(managerAddress);

  if (!account.manager) {
    account.manager = true;
    account.save();
  }

  return account;
}

export function ensureInvestor(investorAddress: Address): Account {
  let account = ensureAccount(investorAddress);

  if (!account.investor) {
    account.investor = true;
    account.save();
  }

  return account;
}

function ensureAccount(accountAddress: Address): Account {
  let account = Account.load(accountAddress.toHex()) as Account;
  if (account) {
    return account;
  }

  account = new Account(accountAddress.toHex());
  account.manager = false;
  account.investor = false;
  account.save();

  return account;
}
