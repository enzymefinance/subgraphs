import { ethereum, Address } from '@graphprotocol/graph-ts';
import { UserUintList } from '../generated/schema';

export function getUserUintListId(
  policyAddress: Address,
  comptrollerProxyAddress: Address,
  userAddress: Address,
): string {
  return policyAddress.toHex() + '/' + comptrollerProxyAddress.toHex() + '/' + userAddress.toHex();
}

export function ensureUserUintList(id: string, user: Address, event: ethereum.Event): UserUintList {
  let userUintList = UserUintList.load(id);

  if (userUintList) {
    return userUintList;
  }

  userUintList = new UserUintList(id);
  userUintList.userAddress = user;
  userUintList.createdAt = event.block.timestamp.toI32();
  userUintList.updatedAt = event.block.timestamp.toI32();
  userUintList.uintLists = new Array<string>();
  userUintList.save();

  return userUintList;
}
