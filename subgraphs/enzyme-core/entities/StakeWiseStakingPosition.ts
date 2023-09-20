import { logCritical, uniqueEventId } from '@enzymefinance/subgraph-utils';
import { Address, BigDecimal, BigInt, ethereum, store } from '@graphprotocol/graph-ts';
import {
  StakeWiseStakingPosition,
  StakeWiseStakingPositionChange,
  Vault,
  ExternalPositionType,
  AssetAmount,
  StakeWiseVaultToken,
  StakeWiseStakingExitRequest,
} from '../generated/schema';
import { getActivityCounter } from './Counter';
import { useVault } from './Vault';

export function useStakeWiseStakingPosition(id: string): StakeWiseStakingPosition {
  let ksp = StakeWiseStakingPosition.load(id);
  if (ksp == null) {
    logCritical('Failed to load fund {}.', [id]);
  }

  return ksp as StakeWiseStakingPosition;
}

export function createStakeWiseStakingPosition(
  externalPositionAddress: Address,
  vaultAddress: Address,
  type: ExternalPositionType,
): StakeWiseStakingPosition {
  let ksp = new StakeWiseStakingPosition(externalPositionAddress.toHex());
  ksp.vault = useVault(vaultAddress.toHex()).id;
  ksp.active = true;
  ksp.type = type.id;
  ksp.save();

  return ksp;
}

export function createStakeWiseStakingPositionChange(
  stakeWiseStakingPositionAddress: Address,
  changeType: string,
  stakeWiseVaultToken: StakeWiseVaultToken,
  assetAmount: AssetAmount,
  shares: BigDecimal,
  vault: Vault,
  event: ethereum.Event,
): StakeWiseStakingPositionChange {
  let change = new StakeWiseStakingPositionChange(uniqueEventId(event));
  change.stakeWiseStakingPositionChangeType = changeType;
  change.externalPosition = stakeWiseStakingPositionAddress.toHex();
  change.vault = vault.id;
  change.stakeWiseVaultToken = stakeWiseVaultToken.id;
  change.assetAmount = assetAmount.id;
  change.shares = shares;
  change.timestamp = event.block.timestamp.toI32();
  change.activityCounter = getActivityCounter();
  change.activityCategories = ['Vault'];
  change.activityType = 'Trade';
  change.save();

  vault.lastAssetUpdate = event.block.timestamp.toI32();
  vault.save();

  return change;
}

export function ensureStakeWiseVaultToken(stakeWiseVault: Address, externalPosition: Address): StakeWiseVaultToken {
  let id = stakeWiseVault.toHex();

  let stakeWiseVaultToken = StakeWiseVaultToken.load(id);
  if (!stakeWiseVaultToken) {
    stakeWiseVaultToken = new StakeWiseVaultToken(id);
    stakeWiseVaultToken.stakeWiseStakingPosition = externalPosition.toHex();
    stakeWiseVaultToken.save();
  }

  return stakeWiseVaultToken;
}

export function stakeWiseStakingExitRequestId(
  stakeWiseStakingPosition: StakeWiseStakingPosition,
  stakeWiseVaultToken: StakeWiseVaultToken,
  positionTicket: BigInt,
): string {
  return stakeWiseStakingPosition.id + '/' + stakeWiseVaultToken.id + '/' + positionTicket.toString();
}

export function createStakeWiseStakingExitRequest(
  stakeWiseStakingPosition: StakeWiseStakingPosition,
  stakeWiseVaultToken: StakeWiseVaultToken,
  positionTicket: BigInt,
  shares: BigDecimal,
): StakeWiseStakingExitRequest {
  let id = stakeWiseStakingExitRequestId(stakeWiseStakingPosition, stakeWiseVaultToken, positionTicket);

  let exitRequest = new StakeWiseStakingExitRequest(id);
  exitRequest.stakeWiseStakingPosition = stakeWiseStakingPosition.id;
  exitRequest.stakeWiseVaultToken = stakeWiseVaultToken.id;
  exitRequest.positionTicket = positionTicket;
  exitRequest.shares = shares;
  exitRequest.save();

  return exitRequest;
}
