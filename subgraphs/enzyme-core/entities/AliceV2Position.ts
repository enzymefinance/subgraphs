import { logCritical, uniqueEventId } from '@enzymefinance/subgraph-utils';
import {
  AliceV2Order,
  AlicePositionChange,
  AssetAmount,
  ExternalPositionType,
  Vault,
  AliceV2Position,
} from '../generated/schema';
import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts';
import { useVault } from './Vault';
import { getActivityCounter } from './Counter';

export function useAliceV2Position(id: string): AliceV2Position {
  let position = AliceV2Position.load(id);
  if (position == null) {
    logCritical('Failed to load AliceV2Position {}.', [id]);
  }

  return position as AliceV2Position;
}

export function createAliceV2Position(
  externalPositionAddress: Address,
  vaultAddress: Address,
  type: ExternalPositionType,
): AliceV2Position {
  let position = new AliceV2Position(externalPositionAddress.toHex());
  position.vault = useVault(vaultAddress.toHex()).id;
  position.active = true;
  position.type = type.id;
  position.save();

  return position;
}

export function createAliceV2PositionChange(
  aliceV2PositionAddress: Address,
  orders: AliceV2Order[],
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
  change.externalPosition = aliceV2PositionAddress.toHex();
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

export function useAliceV2Order(id: string): AliceV2Order {
  let order = AliceV2Order.load(id);
  if (order == null) {
    logCritical('Failed to load AliceOrder {}.', [id]);
  }

  return order as AliceV2Order;
}
