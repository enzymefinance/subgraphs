import { Address, ethereum } from '@graphprotocol/graph-ts';
import { Account, SharesSplitter, SingleAssetRedemptionQueue } from '../generated/schema';

export function createSingleAssetRedemptionQueue(
    singleAssetRedemptionQueueAddress: Address,
    creator: Account,
    event: ethereum.Event,
  ): SingleAssetRedemptionQueue {
    let singleAssetRedemptionQueue = new SharesSplitter(singleAssetRedemptionQueueAddress.toHex());
    singleAssetRedemptionQueue.creator = creator.id;
    singleAssetRedemptionQueue.createdAt = event.block.timestamp.toI32();
    singleAssetRedemptionQueue.save();
  
    return singleAssetRedemptionQueue;
  }
  