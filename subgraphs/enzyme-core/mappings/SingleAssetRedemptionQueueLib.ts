import { arrayDiff, arrayUnique, toBigDecimal } from '@enzymefinance/subgraph-utils';
import {
  ensureSingleAssetRedemptionQueue,
  ensureSingleAssetRedemptionQueueRequest,
} from '../entities/SingleAssetRedemptionQueue';
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
import { Address } from '@graphprotocol/graph-ts';
import { createAssetAmount } from '../entities/AssetAmount';
import { ensureAsset } from '../entities/Asset';
import { ensureComptroller } from '../entities/Comptroller';
import { ensureAccount } from '../entities/Account';

export function handleBypassableSharesThresholdSet(event: BypassableSharesThresholdSet): void {
  let redemptionQueue = ensureSingleAssetRedemptionQueue(event.address, event);
  redemptionQueue.bypassableSharesThreshold = toBigDecimal(event.params.nextSharesAmount);
  redemptionQueue.save();
}

export function handleInitialized(event: Initialized): void {
  let redemptionQueue = ensureSingleAssetRedemptionQueue(event.address, event);
  redemptionQueue.vault = useVault(event.params.vaultProxy.toHex()).id;
  redemptionQueue.save();
}

export function handleRedemptionAssetSet(event: RedemptionAssetSet): void {
  let redemptionQueue = ensureSingleAssetRedemptionQueue(event.address, event);
  redemptionQueue.redemptionAsset = event.params.asset;
  redemptionQueue.save();
}

export function handleManagerAdded(event: ManagerAdded): void {
  let manager = ensureAccount(event.params.user, event);

  let redemptionQueue = ensureSingleAssetRedemptionQueue(event.address, event);
  redemptionQueue.managers = arrayUnique(redemptionQueue.managers.concat([manager.id]));
  redemptionQueue.save();
}

export function handleManagerRemoved(event: ManagerRemoved): void {
  let manager = ensureAccount(event.params.user, event);

  let redemptionQueue = ensureSingleAssetRedemptionQueue(event.address, event);
  redemptionQueue.managers = arrayDiff(redemptionQueue.managers, [manager.id]);
  redemptionQueue.save();
}

export function handleRedeemed(event: Redeemed): void {
  let queue = ensureSingleAssetRedemptionQueue(event.address, event);
  let vault = useVault(queue.vault);
  let comptroller = ensureComptroller(Address.fromString(vault.comptroller), event);
  let denominationAsset = ensureAsset(Address.fromString(comptroller.denomination));

  let asset = ensureAsset(event.params.redemptionAsset);
  let amount = toBigDecimal(event.params.redemptionAssetAmount, asset.decimals);
  let assetAmount = createAssetAmount(asset, amount, denominationAsset, 'single-asset-redemption', event);

  let request = ensureSingleAssetRedemptionQueueRequest(event.params.id, event);
  request.redeemed = true;
  request.redeemedAt = event.block.timestamp.toI32();
  request.redemptionAssetAmount = assetAmount.id;
  request.save();
}

export function handleRedemptionRequestAdded(event: RedemptionRequestAdded): void {
  let queue = ensureSingleAssetRedemptionQueue(event.address, event);

  let request = ensureSingleAssetRedemptionQueueRequest(event.params.id, event);
  request.createdAt = event.block.timestamp.toI32();
  request.sharesAmount = toBigDecimal(event.params.sharesAmount);
  request.account = ensureAccount(event.params.user, event).id;
  request.vault = useVault(queue.vault).id;
  request.singleAssetRedemptionQueue = ensureSingleAssetRedemptionQueue(event.address, event).id;
  request.save();
}

export function handleRequestBypassed(event: RequestBypassed): void {
  let request = ensureSingleAssetRedemptionQueueRequest(event.params.id, event);
  request.bypassed = true;
  request.bypassedAt = event.block.timestamp.toI32();
  request.save();
}

export function handleRequestWithdrawn(event: RequestWithdrawn): void {
  let request = ensureSingleAssetRedemptionQueueRequest(event.params.id, event);
  request.withdrawn = true;
  request.withdrawnAt = event.block.timestamp.toI32();
  request.save();
}

export function handleShutdown(event: Shutdown): void {
  let redemptionQueue = ensureSingleAssetRedemptionQueue(event.address, event);
  redemptionQueue.shutdown = true;
  redemptionQueue.shutdownAt = event.block.timestamp.toI32();
  redemptionQueue.save();
}
