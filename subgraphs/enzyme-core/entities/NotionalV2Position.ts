import { logCritical, uniqueEventId } from '@enzymefinance/subgraph-utils';
import { Address, ethereum } from '@graphprotocol/graph-ts';
import {
  AssetAmount,
  NotionalV2Position,
  NotionalV2PositionChange,
  ExternalPositionType,
  Vault,
  Asset,
} from '../generated/schema';
import { useVault } from './Vault';
import { getActivityCounter } from './Counter';

export function useNotionalV2Position(id: string): NotionalV2Position {
  let nv2p = NotionalV2Position.load(id);
  if (nv2p == null) {
    logCritical('Failed to load NotionalV2Position {}.', [id]);
  }

  return nv2p as NotionalV2Position;
}

export function createNotionalV2Position(
  externalPositionAddress: Address,
  vaultAddress: Address,
  type: ExternalPositionType,
): NotionalV2Position {
  let notionalV2Position = new NotionalV2Position(externalPositionAddress.toHex());
  notionalV2Position.vault = useVault(vaultAddress.toHex()).id;
  notionalV2Position.active = true;
  notionalV2Position.type = type.id;
  notionalV2Position.save();

  return notionalV2Position;
}

export function createNotionalV2PositionChange(
  notionalV2PositionAddress: Address,
  changeType: string,
  incomingAsset: Asset | null,
  incomingAssetAmount: AssetAmount | null,
  outgoingAsset: Asset | null,
  outgoingAssetAmount: AssetAmount | null,
  fCashAmount: string | null,
  maturity: string | null,
  vault: Vault,
  event: ethereum.Event,
): NotionalV2PositionChange {
  let change = new NotionalV2PositionChange(uniqueEventId(event));
  change.externalPosition = notionalV2PositionAddress.toHex();
  change.notionalV2PositionChangeType = changeType;
  change.incomingAsset = incomingAsset != null ? incomingAsset.id : null;
  change.outgoingAssetAmount = outgoingAssetAmount != null ? outgoingAssetAmount.id : null;
  change.fCashAmount = fCashAmount != null ? fCashAmount : null;
  change.maturity = maturity != null ? maturity : null;
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
