import { ethereum, Address } from '@graphprotocol/graph-ts';
import { UserAddressList } from '../generated/schema';

export function getUserAddressListId(
  policyAddress: Address,
  comptrollerProxyAddress: Address,
  userAddress: Address,
): string {
  return policyAddress.toHex() + '/' + comptrollerProxyAddress.toHex() + '/' + userAddress.toHex();
}

export function ensureUserAddressList(id: string, user: Address, event: ethereum.Event): UserAddressList {
  let userAddressList = UserAddressList.load(id);

  if (userAddressList) {
    return userAddressList;
  }

  userAddressList = new UserAddressList(id);
  userAddressList.userAddress = user;
  userAddressList.createdAt = event.block.timestamp.toI32();
  userAddressList.updatedAt = event.block.timestamp.toI32();
  userAddressList.addressLists = new Array<string>();
  userAddressList.save();

  return userAddressList;
}
