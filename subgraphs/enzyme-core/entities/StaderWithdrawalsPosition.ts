import { Address, BigDecimal, BigInt, ethereum } from '@graphprotocol/graph-ts';
import {
  ExternalPositionType,
  StaderWithdrawalsPosition,
  StaderWithdrawalsPositionChange,
  Vault,
} from '../generated/schema';
import { useVault } from './Vault';
import { logCritical, uniqueEventId } from '@enzymefinance/subgraph-utils';
import { getActivityCounter } from './Counter';

export function useStaderWithdrawalsPosition(id: string): StaderWithdrawalsPosition {
  let position = StaderWithdrawalsPosition.load(id);
  if (position == null) {
    logCritical('Failed to load StaderWithdrawalsPosition {}.', [id]);
  }

  return position as StaderWithdrawalsPosition;
}

export function createStaderWithdrawalsPosition(
  externalPositionAddress: Address,
  vaultAddress: Address,
  type: ExternalPositionType,
): StaderWithdrawalsPosition {
  let position = new StaderWithdrawalsPosition(externalPositionAddress.toHex());
  position.vault = useVault(vaultAddress.toHex()).id;
  position.active = true;
  position.type = type.id;
  position.save();

  return position;
}

export function createStaderWithdrawalsPositionChange(
  lidoWithdrawalsPositionAddress: Address,
  changeType: string,
  amount: BigDecimal | null,
  requestId: BigInt | null,
  vault: Vault,
  event: ethereum.Event,
): StaderWithdrawalsPositionChange {
  let change = new StaderWithdrawalsPositionChange(uniqueEventId(event));
  change.staderWithdrawalsPositionChangeType = changeType;
  change.externalPosition = lidoWithdrawalsPositionAddress.toHex();
  change.amount = amount;
  change.requestId = requestId;
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
