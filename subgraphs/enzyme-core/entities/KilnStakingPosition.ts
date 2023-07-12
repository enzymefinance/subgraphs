import { logCritical, uniqueEventId, ZERO_BD } from '@enzymefinance/subgraph-utils';
import { Address, Bytes, ethereum } from '@graphprotocol/graph-ts';
import {
  KilnStakingPosition,
  KilnStakingPositionChange,
  Vault,
  ExternalPositionType,
  AssetAmount,
  KilnStaking,
} from '../generated/schema';
import { KilnStaking4DataSource } from '../generated/templates';
import { getActivityCounter } from './Counter';
import { useVault } from './Vault';

export function useKilnStakingPosition(id: string): KilnStakingPosition {
  let ksp = KilnStakingPosition.load(id);
  if (ksp == null) {
    logCritical('Failed to load fund {}.', [id]);
  }

  return ksp as KilnStakingPosition;
}

export function createKilnStakingPosition(
  externalPositionAddress: Address,
  vaultAddress: Address,
  type: ExternalPositionType,
): KilnStakingPosition {
  let ksp = new KilnStakingPosition(externalPositionAddress.toHex());
  ksp.vault = useVault(vaultAddress.toHex()).id;
  ksp.active = true;
  ksp.type = type.id;
  ksp.stakedEthAmount = ZERO_BD;
  ksp.publicKeys = new Array<Bytes>(0);
  ksp.positionValuePaused = false;
  ksp.save();

  return ksp;
}

export function createKilnStakingPositionChange(
  kilnStakingPositionAddress: Address,
  changeType: string,
  assetAmount: AssetAmount | null,
  publicKeys: Bytes[],
  claimType: string | null,
  vault: Vault,
  event: ethereum.Event,
): KilnStakingPositionChange {
  let change = new KilnStakingPositionChange(uniqueEventId(event));
  change.kilnStakingPositionChangeType = changeType;
  change.externalPosition = kilnStakingPositionAddress.toHex();
  change.vault = vault.id;
  change.assetAmount = assetAmount != null ? assetAmount.id : null;
  change.publicKeys = publicKeys;
  change.claimType = claimType;
  change.timestamp = event.block.timestamp.toI32();
  change.activityCounter = getActivityCounter();
  change.activityCategories = ['Vault'];
  change.activityType = 'Trade';
  change.save();

  vault.lastAssetUpdate = event.block.timestamp.toI32();
  vault.save();

  return change;
}

export function ensureKilnStaking(stakingContractAddress: Address): KilnStaking {
  let kilnStaking = KilnStaking.load(stakingContractAddress.toHex());
  if (!kilnStaking) {
    kilnStaking = new KilnStaking(stakingContractAddress.toHex());
    kilnStaking.save();

    KilnStaking4DataSource.create(stakingContractAddress);
  }

  return kilnStaking;
}
