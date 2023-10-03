import { logCritical, uniqueEventId } from '@enzymefinance/subgraph-utils';
import { Address, ethereum } from '@graphprotocol/graph-ts';
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
  let cdp = AaveV3DebtPosition.load(id);
  if (cdp == null) {
    logCritical('Failed to load fund {}.', [id]);
  }

  return cdp as AaveV3DebtPosition;
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
  aaveV3DebtPosition.eModeCategoryId = 0;
  aaveV3DebtPosition.save();

  return aaveV3DebtPosition;
}

export function createAaveV3DebtPositionChange(
  aaveV3DebtPositionAddress: Address,
  assetAmounts: AssetAmount[] | null,
  eModeCategoryId: number | null,
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
  // 255 is the max value of uint8, so we use 256 to indicate null
  // Unfortunately, it seems that we can't set eModeCategoryId to null
  let noEModeCategoryIdPassed = 256;
  change.eModeCategoryId = eModeCategoryId == null ? noEModeCategoryIdPassed : eModeCategoryId;
  change.save();

  vault.lastAssetUpdate = event.block.timestamp.toI32();
  vault.save();

  return change;
}
