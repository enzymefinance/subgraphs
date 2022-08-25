import { ZERO_ADDRESS } from '@enzymefinance/subgraph-utils';
import { ethereum, BigInt } from '@graphprotocol/graph-ts';
import { UintList } from '../generated/schema';
import { uintListUpdateType } from '../utils/uintListUpdateType';

export function ensureUintList(id: string, event: ethereum.Event): UintList {
  let addressList = UintList.load(id);

  if (addressList) {
    return addressList;
  }

  addressList = new UintList(id);
  addressList.createdAt = event.block.timestamp.toI32();
  addressList.updatedAt = event.block.timestamp.toI32();
  addressList.creator = ZERO_ADDRESS;
  addressList.owner = ZERO_ADDRESS;
  addressList.updateType = uintListUpdateType(0);
  addressList.items = new Array<BigInt>();
  addressList.save();

  return addressList;
}
