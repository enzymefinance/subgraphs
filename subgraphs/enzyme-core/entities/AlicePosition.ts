import { logCritical, uniqueEventId } from '@enzymefinance/subgraph-utils';
import {
  AliceOrder,
  AlicePosition,
  AlicePositionChange,
  AssetAmount,
  ExternalPositionType,
  Vault,
} from '../generated/schema';
import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts';
import { useVault } from './Vault';
import { getActivityCounter } from './Counter';

export function useAlicePosition(id: string): AlicePosition {
  let position = AlicePosition.load(id);
  if (position == null) {
    logCritical('Failed to load AlicePosition {}.', [id]);
  }

  return position as AlicePosition;
}

export function createAlicePosition(
  externalPositionAddress: Address,
  vaultAddress: Address,
  type: ExternalPositionType,
): AlicePosition {
  let position = new AlicePosition(externalPositionAddress.toHex());
  position.vault = useVault(vaultAddress.toHex()).id;
  position.active = true;
  position.type = type.id;
  position.save();

  return position;
}

export function createAlicePositionChange(
  alicePositionAddress: Address,
  orders: AliceOrder[],
  outgoingAssetAmount: AssetAmount | null,
  minIncomingAssetAmount: AssetAmount | null,
  changeType: string,
  vault: Vault,
  event: ethereum.Event,
): AlicePositionChange {
  let change = new AlicePositionChange(uniqueEventId(event));
  change.outgoingAssetAmount = outgoingAssetAmount != null ? outgoingAssetAmount.id : null;
  change.incomingAssetAmount = minIncomingAssetAmount != null ? minIncomingAssetAmount.id : null;
  change.orders = orders.map<string>((order) => order.id);
  change.alicePositionChangeType = changeType;
  change.externalPosition = alicePositionAddress.toHex();
  change.vault = vault.id;
  change.timestamp = event.block.timestamp.toI32();
  change.activityCounter = getActivityCounter();
  change.activityCategories = ['Vault'];
  change.activityType = 'Trade';
  change.save();

  vault.lastAssetUpdate = event.block.timestamp.toI32();
  vault.save();

  return change;
}

export function useAliceOrder(id: string): AliceOrder {
  let order = AliceOrder.load(id);
  if (order == null) {
    logCritical('Failed to load AliceOrder {}.', [id]);
  }

  return order as AliceOrder;
}
