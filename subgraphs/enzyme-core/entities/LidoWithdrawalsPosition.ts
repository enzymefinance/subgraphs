import { Address, BigDecimal, BigInt, ethereum } from '@graphprotocol/graph-ts';
import {
  ExternalPositionType,
  LidoWithdrawalsPosition,
  LidoWithdrawalsPositionChange,
  Vault,
} from '../generated/schema';
import { useVault } from './Vault';
import { logCritical, uniqueEventId } from '@enzymefinance/subgraph-utils';
import { getActivityCounter } from './Counter';

export function useLidoWithdrawalsPosition(id: string): LidoWithdrawalsPosition {
  let lwp = LidoWithdrawalsPosition.load(id);
  if (lwp == null) {
    logCritical('Failed to load LidoWithdrawalsPosition {}.', [id]);
  }

  return lwp as LidoWithdrawalsPosition;
}

export function createLidoWithdrawalsPosition(
  externalPositionAddress: Address,
  vaultAddress: Address,
  type: ExternalPositionType,
): LidoWithdrawalsPosition {
  let lwp = new LidoWithdrawalsPosition(externalPositionAddress.toHex());
  lwp.vault = useVault(vaultAddress.toHex()).id;
  lwp.active = true;
  lwp.type = type.id;
  lwp.save();

  return lwp;
}

export function createLidoWithdrawalsPositionChange(
  lidoWithdrawalsPositionAddress: Address,
  changeType: string,
  amounts: BigDecimal[] | null,
  requestIds: BigInt[] | null,
  vault: Vault,
  event: ethereum.Event,
): LidoWithdrawalsPositionChange {
  let change = new LidoWithdrawalsPositionChange(uniqueEventId(event));
  change.lidoWithdrawalsPositionChangeType = changeType;
  change.externalPosition = lidoWithdrawalsPositionAddress.toHex();
  change.amounts = amounts;
  change.requestIds = requestIds;
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
