import { logCritical, uniqueEventId, ZERO_BD } from '@enzymefinance/subgraph-utils';
import { Address, Bytes, ethereum } from '@graphprotocol/graph-ts';
import {
  StakeWiseStakingPosition,
  StakeWiseStakingPositionChange,
  Vault,
  ExternalPositionType,
  AssetAmount,
} from '../generated/schema';
import { StakeWiseV3StakingPositionLib4DataSource } from '../generated/templates';
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
  ksp.stakedEthAmount = ZERO_BD;
  ksp.positionValuePaused = false;
  ksp.save();

  return ksp;
}

export function createStakeWiseStakingPositionChange(
  stakeWiseStakingPositionAddress: Address,
  changeType: string,
  assetAmount: AssetAmount | null,
  vault: Vault,
  event: ethereum.Event,
): StakeWiseStakingPositionChange {
  let change = new StakeWiseStakingPositionChange(uniqueEventId(event));
  change.stakeWiseStakingPositionChangeType = changeType;
  change.externalPosition = stakeWiseStakingPositionAddress.toHex();
  change.vault = vault.id;
  change.assetAmount = assetAmount != null ? assetAmount.id : null;
  change.timestamp = event.block.timestamp.toI32();
  change.activityCounter = getActivityCounter();
  change.activityCategories = ['Vault'];
  change.activityType = 'Trade';
  change.save();

  vault.lastAssetUpdate = event.block.timestamp.toI32();
  vault.save();

  return change;
}
