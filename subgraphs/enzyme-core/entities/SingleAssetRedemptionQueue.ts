import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts';
import { SingleAssetRedemptionQueue, SingleAssetRedemptionQueueRequest } from '../generated/schema';
import { ZERO_ADDRESS, ZERO_BD } from '@enzymefinance/subgraph-utils';

export function ensureSingleAssetRedemptionQueue(address: Address, event: ethereum.Event): SingleAssetRedemptionQueue {
  let queue = SingleAssetRedemptionQueue.load(address.toHex());

  if (queue != null) {
    return queue;
  }

  queue = new SingleAssetRedemptionQueue(address.toHex());
  queue.creator = ZERO_ADDRESS.toHex();
  queue.createdAt = event.block.timestamp.toI32();
  queue.vault = ZERO_ADDRESS.toHex();
  queue.redemptionAsset = ZERO_ADDRESS;
  queue.bypassableSharesThreshold = ZERO_BD;
  queue.managers = new Array<string>();
  queue.shutdown = false;
  queue.save();

  return queue;
}

export function ensureSingleAssetRedemptionQueueRequest(
  id: BigInt,
  event: ethereum.Event,
): SingleAssetRedemptionQueueRequest {
  let request = SingleAssetRedemptionQueueRequest.load(id.toString());

  if (request != null) {
    return request;
  }

  request = new SingleAssetRedemptionQueueRequest(id.toString());
  request.createdAt = event.block.timestamp.toI32();
  request.sharesAmount = ZERO_BD;
  request.vault = ZERO_ADDRESS.toHex();
  request.account = ZERO_ADDRESS.toHex();
  request.singleAssetRedemptionQueue = ZERO_ADDRESS.toHex();
  request.bypassed = false;
  request.withdrawn = false;
  request.redeemed = false;
  request.save();

  return request;
}
