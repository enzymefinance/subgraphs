import { Address, ethereum } from '@graphprotocol/graph-ts';
import { ExternalPositionType, PendleV2Position, PendleV2PositionChange, Vault } from '../generated/schema';
import { useVault } from './Vault';
import { getActivityCounter } from './Counter';
import { logCritical, uniqueEventId } from '@enzymefinance/subgraph-utils';

export function usePendleV2Position(id: string): PendleV2Position {
  let pp = PendleV2Position.load(id);
  if (pp == null) {
    logCritical('Failed to load fund {}.', [id]);
  }

  return pp as PendleV2Position;
}

export function createPendleV2Position(
  externalPositionAddress: Address,
  vaultAddress: Address,
  type: ExternalPositionType,
): PendleV2Position {
  let position = new PendleV2Position(externalPositionAddress.toHex());
  position.vault = useVault(vaultAddress.toHex()).id;
  position.active = true;
  position.type = type.id;
  position.save();

  return position;
}

export function createPendleV2PositionChange(
  position: Address,
  changeType: string,
  vault: Vault,
  event: ethereum.Event,
): PendleV2PositionChange {
  let change = new PendleV2PositionChange(uniqueEventId(event));
  change.pendleV2PositionChangeType = changeType;
  change.externalPosition = position.toHex();
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
