import { Address, ethereum } from '@graphprotocol/graph-ts';
import { Account } from '../generated/schema';
import { trackNetworkInvestors, trackNetworkManagers } from './NetworkState';

export function ensureManager(managerAddress: Address, event: ethereum.Event): Account {
  let account = ensureAccount(managerAddress, event);

  if (!account.manager) {
    account.manager = true;
    account.managerSince = event.block.timestamp;
    account.save();

    trackNetworkManagers(event);
  }

  return account;
}

export function ensureInvestor(investorAddress: Address, event: ethereum.Event): Account {
  let account = ensureAccount(investorAddress, event);

  if (!account.investor) {
    account.investor = true;
    account.investorSince = event.block.timestamp;
    account.save();

    trackNetworkInvestors(event);
  }

  return account;
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
  account.authUser = false;
  account.save();

  return account;
}
