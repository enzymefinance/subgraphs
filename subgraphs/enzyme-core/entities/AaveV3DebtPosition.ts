import { logCritical, uniqueEventId } from '@enzymefinance/subgraph-utils';
import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts';
import {
  AaveV3DebtPosition,
  AaveV3DebtPositionChange,
  Vault,
  AssetAmount,
  ExternalPositionType,
} from '../generated/schema';
import { getActivityCounter } from './Counter';
import { useVault } from './Vault';

export function useAaveV3DebtPosition(id: string): AaveV3DebtPosition {
  let adp = AaveV3DebtPosition.load(id);
  if (adp == null) {
    logCritical('Failed to load position {}.', [id]);
  }

  return adp as AaveV3DebtPosition;
}

export function setEModeAaveV3DebtPosition(externalPosition: Address, eModeCategoryId: BigInt): AaveV3DebtPosition {
  let adp = useAaveV3DebtPosition(externalPosition.toHex());

  adp.eModeCategoryId = eModeCategoryId;
  adp.save();

  return adp as AaveV3DebtPosition;
}

export function createAaveV3DebtPosition(
  externalPositionAddress: Address,
  vaultAddress: Address,
  type: ExternalPositionType,
): AaveV3DebtPosition {
  let aaveV3DebtPosition = new AaveV3DebtPosition(externalPositionAddress.toHex());
  aaveV3DebtPosition.vault = useVault(vaultAddress.toHex()).id;
  aaveV3DebtPosition.active = true;
  aaveV3DebtPosition.type = type.id;
  aaveV3DebtPosition.eModeCategoryId = BigInt.fromI32(0);
  aaveV3DebtPosition.save();

  return aaveV3DebtPosition;
}

export function createAaveV3DebtPositionChange(
  aaveV3DebtPositionAddress: Address,
  assetAmounts: AssetAmount[] | null,
  eModeCategoryId: BigInt | null,
  changeType: string,
  vault: Vault,
  event: ethereum.Event,
): AaveV3DebtPositionChange {
  let change = new AaveV3DebtPositionChange(uniqueEventId(event));
  change.aaveV3DebtPositionChangeType = changeType;
  change.externalPosition = aaveV3DebtPositionAddress.toHex();
  change.assetAmounts = assetAmounts != null ? assetAmounts.map<string>((assetAmount) => assetAmount.id) : null;
  change.vault = vault.id;
  change.timestamp = event.block.timestamp.toI32();
  change.activityCounter = getActivityCounter();
  change.activityCategories = ['Vault'];
  change.activityType = 'Trade';
  change.eModeCategoryId = eModeCategoryId;
  change.save();

  vault.lastAssetUpdate = event.block.timestamp.toI32();
  vault.save();

  return change;
}
