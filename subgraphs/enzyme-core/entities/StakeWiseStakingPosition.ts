import { ZERO_BD, logCritical, uniqueEventId } from '@enzymefinance/subgraph-utils';
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
  let position = StakeWiseStakingPosition.load(id);
  if (position == null) {
    logCritical('Failed to load stakewise staking position {}.', [id]);
  }

  return position as StakeWiseStakingPosition;
}

export function createStakeWiseStakingPosition(
  externalPositionAddress: Address,
  vaultAddress: Address,
  type: ExternalPositionType,
): StakeWiseStakingPosition {
  let position = new StakeWiseStakingPosition(externalPositionAddress.toHex());
  position.vault = useVault(vaultAddress.toHex()).id;
  position.vaultTokens = new Array<string>();
  position.active = true;
  position.type = type.id;
  position.stakedEthAmount = ZERO_BD;
  position.save();

  return position;
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

export function ensureStakeWiseVaultToken(stakeWiseVault: Address, event: ethereum.Event): StakeWiseVaultToken {
  let id = stakeWiseVault.toHex();

  let stakeWiseVaultToken = StakeWiseVaultToken.load(id);
  if (!stakeWiseVaultToken) {
    stakeWiseVaultToken = new StakeWiseVaultToken(id);
    stakeWiseVaultToken.createdAt = event.block.timestamp.toI32();
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
  timestamp: i32,
): StakeWiseStakingExitRequest {
  let id = stakeWiseStakingExitRequestId(stakeWiseStakingPosition, stakeWiseVaultToken, positionTicket);

  let exitRequest = new StakeWiseStakingExitRequest(id);
  exitRequest.stakeWiseStakingPosition = stakeWiseStakingPosition.id;
  exitRequest.stakeWiseVaultToken = stakeWiseVaultToken.id;
  exitRequest.positionTicket = positionTicket;
  exitRequest.shares = shares;
  exitRequest.createdAt = timestamp;
  exitRequest.claimed = false;
  exitRequest.save();

  return exitRequest;
}

export function useStakeWiseStakingExitRequest(id: string): StakeWiseStakingExitRequest {
  let exitRequest = StakeWiseStakingExitRequest.load(id);
  if (exitRequest == null) {
    logCritical('Failed to load stakewise staking exit request {}.', [id]);
  }

  return exitRequest as StakeWiseStakingExitRequest;
}
