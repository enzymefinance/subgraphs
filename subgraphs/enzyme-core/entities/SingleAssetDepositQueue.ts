import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts';
import { SingleAssetDepositQueue, SingleAssetDepositQueueRequest } from '../generated/schema';
import { ZERO_ADDRESS } from '@enzymefinance/subgraph-utils';

export function ensureSingleAssetDepositQueue(address: Address, event: ethereum.Event): SingleAssetDepositQueue {
  let queue = SingleAssetDepositQueue.load(address.toHex());

  if (queue != null) {
    return queue;
  }

  queue = new SingleAssetDepositQueue(address.toHex());
  queue.creator = ZERO_ADDRESS.toHex();
  queue.createdAt = event.block.timestamp.toI32();
  queue.vault = ZERO_ADDRESS.toHex();
  queue.depositAsset = null;
  queue.depositAssetAddress = ZERO_ADDRESS;
  queue.minRequestTime = 0;
  queue.minDepositAssetAmount = BigInt.fromI32(0);
  queue.depositorAllowlist = null;
  queue.managers = new Array<string>();
  queue.shutdown = false;
  queue.save();

  return queue;
}

function singleAssetDepositQueueId(queue: SingleAssetDepositQueue, requestId: BigInt): string {
  return queue.id + '/' + requestId.toString();
}

export function ensureSingleAssetDepositQueueRequest(
  queue: SingleAssetDepositQueue,
  requestId: BigInt,
  event: ethereum.Event,
): SingleAssetDepositQueueRequest {
  let id = singleAssetDepositQueueId(queue, requestId);

  let request = SingleAssetDepositQueueRequest.load(id);

  if (request != null) {
    return request;
  }

  request = new SingleAssetDepositQueueRequest(id);
  request.requestId = requestId;
  request.createdAt = event.block.timestamp.toI32();
  request.depositAssetAmount = '';
  request.vault = ZERO_ADDRESS.toHex();
  request.account = ZERO_ADDRESS.toHex();
  request.singleAssetDepositQueue = ZERO_ADDRESS.toHex();
  request.cancelableAt = 0;
  request.bypassed = false;
  request.canceled = false;
  request.deposited = false;
  request.save();

  return request;
}
