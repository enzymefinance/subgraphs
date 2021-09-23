import { ZERO_ADDRESS } from '@enzymefinance/subgraph-utils';
import { Bytes, ethereum } from '@graphprotocol/graph-ts';
import { AddressList } from '../generated/schema';
import { addressListUpdateType } from '../utils/addressListUpdateType';

export function ensureAddressList(id: string, event: ethereum.Event): AddressList {
  let addressList = AddressList.load(id);

  if (addressList) {
    return addressList;
  }

  addressList = new AddressList(id);
  addressList.createdAt = event.block.timestamp.toI32();
  addressList.updatedAt = event.block.timestamp.toI32();
  addressList.creator = ZERO_ADDRESS;
  addressList.owner = ZERO_ADDRESS;
  addressList.updateType = addressListUpdateType(0);
  addressList.items = new Array<Bytes>();
  addressList.save();

  return addressList;
}
