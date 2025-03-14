import { logCritical, uniqueEventId } from '@enzymefinance/subgraph-utils';
import {
  MysoV3Escrow,
  MysoV3OptionsWritingPosition,
  MysoV3OptionsWritingPositionChange,
  AssetAmount,
  ExternalPositionType,
  Vault,
  Asset,
} from '../generated/schema';
import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts';
import { useVault } from './Vault';
import { getActivityCounter } from './Counter';

export function useMysoV3OptionsWritingPosition(id: string): MysoV3OptionsWritingPosition {
  let position = MysoV3OptionsWritingPosition.load(id);
  if (position == null) {
    logCritical('Failed to load MysoV3OptionsWritingPosition {}.', [id]);
  }

  return position as MysoV3OptionsWritingPosition;
}

export function createMysoV3OptionsWritingPosition(
  externalPositionAddress: Address,
  vaultAddress: Address,
  type: ExternalPositionType,
): MysoV3OptionsWritingPosition {
  let position = new MysoV3OptionsWritingPosition(externalPositionAddress.toHex());
  position.vault = useVault(vaultAddress.toHex()).id;
  position.active = true;
  position.type = type.id;
  position.save();

  return position;
}

export function createMysoV3OptionsWritingPositionChange(
  MysoV3OptionsWritingPositionAddress: Address,
  escrows: MysoV3Escrow[],
  assets: Asset[] | null,
  assetAmount: AssetAmount | null,
  changeType: string,
  vault: Vault,
  event: ethereum.Event,
): MysoV3OptionsWritingPositionChange {
  let change = new MysoV3OptionsWritingPositionChange(uniqueEventId(event));
  change.assets = assets == null ? null : assets.map<string>((asset) => asset.id);
  change.assetAmount = assetAmount == null ? null : assetAmount.id;
  change.escrows = escrows.map<string>((escrow) => escrow.id);
  change.mysoV3OptionsWritingPositionChangeType = changeType;
  change.externalPosition = MysoV3OptionsWritingPositionAddress.toHex();
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

export function useMysoV3Escrow(id: string): MysoV3Escrow {
  let escrow = MysoV3Escrow.load(id);
  if (escrow == null) {
    logCritical('Failed to load MysoV3Escrow {}.', [id]);
  }

  return escrow as MysoV3Escrow;
}
