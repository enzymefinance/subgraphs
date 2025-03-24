import { logCritical, uniqueEventId } from '@enzymefinance/subgraph-utils';
import {
  MysoV3Escrow,
  MysoV3OptionWritingPosition,
  MysoV3OptionWritingPositionChange,
  AssetAmount,
  ExternalPositionType,
  Vault,
  Asset,
} from '../generated/schema';
import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts';
import { useVault } from './Vault';
import { getActivityCounter } from './Counter';
import { EscrowClosedAndSwept } from '../generated/contracts/MysoV3OptionWritingPositionLib4Events';

export function useMysoV3OptionWritingPosition(id: string): MysoV3OptionWritingPosition {
  let position = MysoV3OptionWritingPosition.load(id);
  if (position == null) {
    logCritical('Failed to load MysoV3OptionWritingPosition {}.', [id]);
  }

  return position as MysoV3OptionWritingPosition;
}

export function createMysoV3OptionWritingPosition(
  externalPositionAddress: Address,
  vaultAddress: Address,
  type: ExternalPositionType,
): MysoV3OptionWritingPosition {
  let position = new MysoV3OptionWritingPosition(externalPositionAddress.toHex());
  position.vault = useVault(vaultAddress.toHex()).id;
  position.active = true;
  position.type = type.id;
  position.save();

  return position;
}

export function createMysoV3OptionWritingPositionChange(
  MysoV3OptionWritingPositionAddress: Address,
  escrows: MysoV3Escrow[] | null,
  assets: Asset[] | null,
  assetAmount: AssetAmount | null,
  changeType: string,
  vault: Vault,
  event: ethereum.Event,
): MysoV3OptionWritingPositionChange {
  let change = new MysoV3OptionWritingPositionChange(uniqueEventId(event));
  change.assets = assets == null ? null : assets.map<string>((asset) => asset.id);
  change.assetAmount = assetAmount == null ? null : assetAmount.id;
  change.escrows = escrows == null ? null : escrows.map<string>((escrow) => escrow.id);
  change.mysoV3OptionWritingPositionChangeType = changeType;
  change.externalPosition = MysoV3OptionWritingPositionAddress.toHex();
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

export function createMysoV3Escrow(escrowId: BigInt): MysoV3Escrow {
  let escrow = new MysoV3Escrow(escrowId.toHex());
  escrow.escrowId = escrowId;
  escrow.save();

  return escrow;
}

export function useMysoV3Escrow(escrowId: BigInt): MysoV3Escrow {
  let escrow = MysoV3Escrow.load(escrowId.toHex());
  if (escrow == null) {
    logCritical("Failed to load MysoV3Escrow with id {}.", [escrowId.toString()]);
  }
  return escrow as MysoV3Escrow;
}


