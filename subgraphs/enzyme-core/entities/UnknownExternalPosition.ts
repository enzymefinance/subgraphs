import { logCritical, uniqueEventId } from '@enzymefinance/subgraph-utils';
import { Address, ethereum } from '@graphprotocol/graph-ts';
import {
  UnknownExternalPosition,
  UnknownExternalPositionChange,
  ExternalPositionType,
  Vault,
} from '../generated/schema';

import { getActivityCounter } from './Counter';
import { useVault } from './Vault';

export function useUnknownExternalPosition(id: string): UnknownExternalPosition {
  let externalPosition = UnknownExternalPosition.load(id);
  if (externalPosition == null) {
    logCritical('Failed to load UnknownExternalPosition {}.', [id]);
  }

  return externalPosition as UnknownExternalPosition;
}

export function createUnknownExternalPosition(
  externalPositionAddress: Address,
  vaultAddress: Address,
  type: ExternalPositionType,
): UnknownExternalPosition {
  let externalPosition = new UnknownExternalPosition(externalPositionAddress.toHex());
  externalPosition.vault = useVault(vaultAddress.toHex()).id;
  externalPosition.active = true;
  externalPosition.type = type.id;
  externalPosition.save();

  return externalPosition;
}

export function createUnknownExternalPositionChange(
  externalPositionAddress: Address,
  vault: Vault,
  event: ethereum.Event,
): UnknownExternalPositionChange {
  let change = new UnknownExternalPositionChange(uniqueEventId(event));
  change.externalPosition = externalPositionAddress.toHex();
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
