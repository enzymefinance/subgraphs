import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts';
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

  account.ownerSince = BigInt.fromI32(0);
  account.authUserSince = BigInt.fromI32(0);
  account.assetManagerSince = BigInt.fromI32(0);
  account.investorSince = BigInt.fromI32(0);
  account.save();

  return account;
}

export function ensureOwner(ownerAddress: Address, event: ethereum.Event): Account {
  let account = ensureAccount(ownerAddress, event);

  if (!account.isOwner) {
    account.isOwner = true;
    account.ownerSince = event.block.timestamp;
    account.save();

    trackNetworkManagers(event);
  }

  return account;
}

export function ensureAuthUser(investorAddress: Address, event: ethereum.Event): Account {
  let account = ensureAccount(investorAddress, event);

  if (!account.isAuthUser) {
    account.isAuthUser = true;
    account.authUserSince = event.block.timestamp;
    account.save();
  }

  return account;
}

export function ensureAssetManager(investorAddress: Address, event: ethereum.Event): Account {
  let account = ensureAccount(investorAddress, event);

  if (!account.isAssetManager) {
    account.isAssetManager = true;
    account.assetManagerSince = event.block.timestamp;
    account.save();
  }

  return account;
}

export function ensureInvestor(investorAddress: Address, event: ethereum.Event): Account {
  let account = ensureAccount(investorAddress, event);

  if (!account.isInvestor) {
    account.isInvestor = true;
    account.investorSince = event.block.timestamp;
    account.save();

    trackNetworkInvestors(event);
  }

  return account;
}
