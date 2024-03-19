import { toBigDecimal } from '@enzymefinance/subgraph-utils';
import { ensureSingleAssetRedemptionQueue } from '../entities/SingleAssetRedemptionQueue';
import { useVault } from '../entities/Vault';
import {
  Initialized,
  ManagerAdded,
  ManagerRemoved,
  Redeemed,
  RedemptionAssetSet,
  RedemptionRequestAdded,
  BypassableSharesThresholdSet,
  RequestBypassed,
  RequestWithdrawn,
  Shutdown,
} from '../generated/contracts/SingleAssetRedemptionQueueLibEvents';
import { SingleAssetRedemptionQueueManager } from '../generated/schema';
import { Address, store } from '@graphprotocol/graph-ts';

function managerId(redemptionQueue: Address, user: Address): string{
  return redemptionQueue.toHex() + "/" + user.toHex();
}

export function handleBypassableSharesThresholdSet(event: BypassableSharesThresholdSet): void {
  let redemptionQueue = ensureSingleAssetRedemptionQueue(event.address);
  redemptionQueue.bypassableSharesThreshold = toBigDecimal(event.params.nextSharesAmount);
  redemptionQueue.save();
}


export function handleInitialized(event: Initialized): void {
  let redemptionQueue = ensureSingleAssetRedemptionQueue(event.address);
  redemptionQueue.vault = useVault(event.params.vaultProxy.toHex()).id;
  redemptionQueue.save();
}

export function handleRedemptionAssetSet(event: RedemptionAssetSet): void {
  let redemptionQueue = ensureSingleAssetRedemptionQueue(event.address);
  redemptionQueue.redemptionAsset = event.params.asset;
  redemptionQueue.save();
}

export function handleManagerAdded(event: ManagerAdded): void {
  let id = managerId(event.address, event.params.user);

  let manager = new SingleAssetRedemptionQueueManager(id);
  manager.manager = event.params.user;
  manager.singleAssetRedemptionQueue = ensureSingleAssetRedemptionQueue(event.address).id;
  manager.save();
}

export function handleManagerRemoved(event: ManagerRemoved): void {
  let id = managerId(event.address, event.params.user);
  
  store.remove('SingleAssetRedemptionQueueManager', id);

}

export function handleRedeemed(event: Redeemed): void {}
export function handleRedemptionRequestAdded(event: RedemptionRequestAdded): void {}
export function handleRequestBypassed(event: RequestBypassed): void {}
export function handleRequestWithdrawn(event: RequestWithdrawn): void {}

export function handleShutdown(event: Shutdown): void {
  let redemptionQueue = ensureSingleAssetRedemptionQueue(event.address);
  redemptionQueue.shutdown = true;
  redemptionQueue.save();
}
