import { arrayDiff, arrayUnique, toBigDecimal } from '@enzymefinance/subgraph-utils';
import { Address } from '@graphprotocol/graph-ts';
import {
  ensureSingleAssetDepositQueue,
  ensureSingleAssetDepositQueueRequest,
} from '../entities/SingleAssetDepositQueue';
import { useVault } from '../entities/Vault';
import {
  Initialized,
  ManagerAdded,
  ManagerRemoved,
  Deposited,
  DepositRequestAdded,
  RequestBypassed,
  RequestCanceled,
  Shutdown,
  MinDepositAssetAmountSet,
  MinRequestTimeSet,
  DepositorAllowlistIdSet,
} from '../generated/contracts/SingleAssetDepositQueueLibEvents';
import { createAssetAmount } from '../entities/AssetAmount';
import { ensureAsset, isAsset } from '../entities/Asset';
import { ensureAccount } from '../entities/Account';

export function handleInitialized(event: Initialized): void {
  let depositQueue = ensureSingleAssetDepositQueue(event.address, event);
  depositQueue.vault = useVault(event.params.vaultProxy.toHex()).id;
  if (!isAsset(event.params.depositAsset)) {
    let depositAsset = ensureAsset(event.params.depositAsset);
    depositQueue.depositAsset = depositAsset.id;
  }
  depositQueue.save();
}

export function handleManagerAdded(event: ManagerAdded): void {
  let manager = ensureAccount(event.params.user, event);

  let depositQueue = ensureSingleAssetDepositQueue(event.address, event);
  depositQueue.managers = arrayUnique(depositQueue.managers.concat([manager.id]));
  depositQueue.save();
}

export function handleManagerRemoved(event: ManagerRemoved): void {
  let manager = ensureAccount(event.params.user, event);

  let depositQueue = ensureSingleAssetDepositQueue(event.address, event);
  depositQueue.managers = arrayDiff(depositQueue.managers, [manager.id]);
  depositQueue.save();
}

export function handleDeposited(event: Deposited): void {
  let queue = ensureSingleAssetDepositQueue(event.address, event);

  let request = ensureSingleAssetDepositQueueRequest(queue, event.params.id, event);
  request.deposited = true;
  request.depositedAt = event.block.timestamp.toI32();
  request.sharesAmount = toBigDecimal(event.params.sharesAmountReceived, 18);
  request.save();
}

export function handleDepositRequestAdded(event: DepositRequestAdded): void {
  let queue = ensureSingleAssetDepositQueue(event.address, event);

  let depositAssetAddress = queue.depositAsset;
  if (depositAssetAddress == null) {
    return;
  }

  let request = ensureSingleAssetDepositQueueRequest(queue, event.params.id, event);
  request.createdAt = event.block.timestamp.toI32();

  let depositAsset = ensureAsset(
    Address.fromString(
      // as string added because subgraph is not smart enough to checkout that depositAssetAddress is not null, because of the condition above
      depositAssetAddress as string,
    ),
  );
  let amount = toBigDecimal(event.params.depositAssetAmount, depositAsset.decimals);
  let assetAmount = createAssetAmount(depositAsset, amount, depositAsset, 'single-asset-deposit', event);
  request.depositAssetAmount = assetAmount.id;

  request.account = ensureAccount(event.params.user, event).id;
  request.vault = useVault(queue.vault).id;
  request.cancelableAt = event.params.canCancelTime.toI32();
  request.singleAssetDepositQueue = ensureSingleAssetDepositQueue(event.address, event).id;
  request.save();
}

export function handleRequestBypassed(event: RequestBypassed): void {
  let depositQueue = ensureSingleAssetDepositQueue(event.address, event);

  let request = ensureSingleAssetDepositQueueRequest(depositQueue, event.params.id, event);
  request.bypassed = true;
  request.bypassedAt = event.block.timestamp.toI32();
  request.save();
}

export function handleRequestCanceled(event: RequestCanceled): void {
  let queue = ensureSingleAssetDepositQueue(event.address, event);

  let request = ensureSingleAssetDepositQueueRequest(queue, event.params.id, event);
  request.canceled = true;
  request.canceledAt = event.block.timestamp.toI32();
  request.save();
}

export function handleShutdown(event: Shutdown): void {
  let depositQueue = ensureSingleAssetDepositQueue(event.address, event);
  depositQueue.shutdown = true;
  depositQueue.shutdownAt = event.block.timestamp.toI32();
  depositQueue.save();
}

export function handleMinDepositAssetAmountSet(event: MinDepositAssetAmountSet): void {
  let depositQueue = ensureSingleAssetDepositQueue(event.address, event);

  // Initialized is called after this event, so we cannot use depositAsset to get decimals, and store as BigDecimal
  depositQueue.minDepositAssetAmount = event.params.minDepositAssetAmount;
  depositQueue.save();
}

export function handleMinRequestTimeSet(event: MinRequestTimeSet): void {
  let depositQueue = ensureSingleAssetDepositQueue(event.address, event);

  depositQueue.minRequestTime = event.params.minRequestTime.toI32();
  depositQueue.save();
}

export function handleDepositorAllowlistIdSet(event: DepositorAllowlistIdSet): void {
  let depositQueue = ensureSingleAssetDepositQueue(event.address, event);

  depositQueue.depositorAllowlist = event.params.depositorAllowlistId.toString();
  depositQueue.save();
}
