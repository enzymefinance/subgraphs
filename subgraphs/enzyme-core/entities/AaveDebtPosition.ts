import { logCritical, toBigDecimal, uniqueEventId } from '@enzymefinance/subgraph-utils';
import { Address, ethereum } from '@graphprotocol/graph-ts';
import { ProtocolSdk } from '../generated/contracts/ProtocolSdk';
import {
  Asset,
  AaveDebtPosition,
  AaveDebtPositionChange,
  Vault,
  AssetAmount,
  ExternalPositionType,
} from '../generated/schema';
import { ensureAsset } from './Asset';
import { createAssetBalance } from './AssetBalance';
import { getActivityCounter } from './Counter';
import { useVault } from './Vault';

export function useAaveDebtPosition(id: string): AaveDebtPosition {
  let cdp = AaveDebtPosition.load(id);
  if (cdp == null) {
    logCritical('Failed to load fund {}.', [id]);
  }

  return cdp as AaveDebtPosition;
}

export function createAaveDebtPosition(
  externalPositionAddress: Address,
  vaultAddress: Address,
  type: ExternalPositionType,
): AaveDebtPosition {
  let aaveDebtPosition = new AaveDebtPosition(externalPositionAddress.toHex());
  aaveDebtPosition.vault = useVault(vaultAddress.toHex()).id;
  aaveDebtPosition.active = true;
  aaveDebtPosition.type = type.id;
  aaveDebtPosition.save();

  return aaveDebtPosition;
}

export function createAaveDebtPositionChange(
  aaveDebtPositionAddress: Address,
  assetAmounts: AssetAmount[] | null,
  changeType: string,
  vault: Vault,
  event: ethereum.Event,
): AaveDebtPositionChange {
  let change = new AaveDebtPositionChange(uniqueEventId(event));
  change.aaveDebtPositionChangeType = changeType;
  change.externalPosition = aaveDebtPositionAddress.toHex();
  change.assetAmounts = assetAmounts != null ? assetAmounts.map<string>((assetAmount) => assetAmount.id) : null;
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
