import { logCritical, uniqueEventId } from '@enzymefinance/subgraph-utils';
import { AlicePosition, AlicePositionChange, ExternalPositionType, Vault } from '../generated/schema';
import { Address, ethereum } from '@graphprotocol/graph-ts';
import { useVault } from './Vault';
import { getActivityCounter } from './Counter';

export function useAlicePosition(id: string): AlicePosition {
  let position = AlicePosition.load(id);
  if (position == null) {
    logCritical('Failed to load fund {}.', [id]);
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
  changeType: string,
  vault: Vault,
  event: ethereum.Event,
): AlicePositionChange {
  let change = new AlicePositionChange(uniqueEventId(event));
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
