import { Address, Bytes, ethereum } from '@graphprotocol/graph-ts';
import {
  ExternalPositionType,
  GMXV2LeverageTradingPosition,
  GMXV2LeverageTradingPositionChange,
  Vault,
} from '../generated/schema';
import { useVault } from './Vault';
import { getActivityCounter } from './Counter';
import { logCritical, uniqueEventId } from '@enzymefinance/subgraph-utils';

export function useGMXV2LeverageTradingPosition(id: string): GMXV2LeverageTradingPosition {
  let position = GMXV2LeverageTradingPosition.load(id);
  if (position == null) {
    logCritical('Failed to load fund {}.', [id]);
  }

  return position as GMXV2LeverageTradingPosition;
}

export function createGMXV2LeverageTradingPosition(
  externalPositionAddress: Address,
  vaultAddress: Address,
  type: ExternalPositionType,
): GMXV2LeverageTradingPosition {
  let position = new GMXV2LeverageTradingPosition(externalPositionAddress.toHex());
  position.vault = useVault(vaultAddress.toHex()).id;
  position.active = true;
  position.type = type.id;
  position.trackedMarkets = new Array<Bytes>(0);
  position.trackedAssets = new Array<string>(0);
  position.save();

  return position;
}

export function createGMXV2LeverageTradingPositionChange(
  position: Address,
  changeType: string,
  vault: Vault,
  event: ethereum.Event,
): GMXV2LeverageTradingPositionChange {
  let change = new GMXV2LeverageTradingPositionChange(uniqueEventId(event));
  change.gmxV2LeverageTradingPositionChangeType = changeType;
  change.externalPosition = position.toHex();
  change.assets = new Array<string>(0);
  change.assetAmounts = new Array<string>(0);
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
