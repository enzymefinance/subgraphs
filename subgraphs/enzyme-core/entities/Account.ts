import { Address, ethereum } from '@graphprotocol/graph-ts';
import { Account } from '../generated/schema';
import { trackNetworkInvestors, trackNetworkManagers } from './Network';

export function ensureAccount(accountAddress: Address, event: ethereum.Event): Account {
  let account = Account.load(accountAddress.toHex()) as Account;

  if (account) {
    return account;
  }

  account = new Account(accountAddress.toHex());

  account.isOwner = false;
  account.isAuthUser = false;
  account.isAssetManager = false;
  account.isInvestor = false;

  account.ownerSince = 0;
  account.authUserSince = 0;
  account.assetManagerSince = 0;
  account.investorSince = 0;
  account.save();

  return account;
}

export function ensureOwner(ownerAddress: Address, event: ethereum.Event): Account {
  let account = ensureAccount(ownerAddress, event);

  if (!account.isOwner) {
    account.isOwner = true;
    account.ownerSince = event.block.timestamp.toI32();
    account.save();

    trackNetworkManagers(event);
  }

  return account;
}

export function ensureAuthUser(investorAddress: Address, event: ethereum.Event): Account {
  let account = ensureAccount(investorAddress, event);

  if (!account.isAuthUser) {
    account.isAuthUser = true;
    account.authUserSince = event.block.timestamp.toI32();
    account.save();
  }

  return account;
}

export function ensureAssetManager(investorAddress: Address, event: ethereum.Event): Account {
  let account = ensureAccount(investorAddress, event);

  if (!account.isAssetManager) {
    account.isAssetManager = true;
    account.assetManagerSince = event.block.timestamp.toI32();
    account.save();
  }

  return account;
}

export function ensureInvestor(investorAddress: Address, event: ethereum.Event): Account {
  let account = ensureAccount(investorAddress, event);

  if (!account.isInvestor) {
    account.isInvestor = true;
    account.investorSince = event.block.timestamp.toI32();
    account.save();

    trackNetworkInvestors(event);
  }

  return account;
}
