import { Address, ethereum } from '@graphprotocol/graph-ts';
import { Account } from '../generated/schema';
import { logCritical } from '../utils/logCritical';
import { trackNetworkInvestors, trackNetworkManagers } from './NetworkState';

export function useManager(id: string): Account {
  let manager = Account.load(id) as Account;

  if (manager == null) {
    logCritical('Failed to load account {}.', [id]);
  } else if (!manager.manager) {
    logCritical('Account {} is not a manager.', [id]);
  }

  return manager;
}

export function ensureManager(managerAddress: Address, event: ethereum.Event): Account {
  let account = ensureAccount(managerAddress, event);

  if (!account.manager) {
    account.manager = true;
    account.save();

    trackNetworkManagers(event);
  }

  return account;
}

export function useInvestor(id: string): Account {
  let investor = Account.load(id);

  if (investor == null) {
    logCritical('Failed to load account {}.', [id]);
  } else if (!investor.investor) {
    logCritical('Account {} is not an investor.', [id]);
  }

  return investor as Account;
}

export function ensureInvestor(investorAddress: Address, event: ethereum.Event): Account {
  let account = ensureAccount(investorAddress, event);

  if (!account.investor) {
    account.investor = true;
    account.save();

    trackNetworkInvestors(event);
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
