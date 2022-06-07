import { logCritical, toBigDecimal, uniqueEventId } from '@enzymefinance/subgraph-utils';
import { Address, ethereum } from '@graphprotocol/graph-ts';
import { ProtocolSdk } from '../generated/contracts/ProtocolSdk';
import {
  AssetAmount,
  CompoundDebtPosition,
  CompoundDebtPositionChange,
  ExternalPositionType,
  Vault,
} from '../generated/schema';
import { ensureAsset } from './Asset';
import { createAssetBalance } from './AssetBalance';
import { getActivityCounter } from './Counter';
import { useVault } from './Vault';

export function useCompoundDebtPosition(id: string): CompoundDebtPosition {
  let cdp = CompoundDebtPosition.load(id);
  if (cdp == null) {
    logCritical('Failed to load CompoundDebtPosition {}.', [id]);
  }

  return cdp as CompoundDebtPosition;
}

export function createCompoundDebtPosition(
  externalPositionAddress: Address,
  vaultAddress: Address,
  type: ExternalPositionType,
): CompoundDebtPosition {
  let compoundDebtPosition = new CompoundDebtPosition(externalPositionAddress.toHex());
  compoundDebtPosition.vault = useVault(vaultAddress.toHex()).id;
  compoundDebtPosition.active = true;
  compoundDebtPosition.type = type.id;
  compoundDebtPosition.collateralAssetBalances = new Array<string>();
  compoundDebtPosition.borrowedAssetBalances = new Array<string>();
  compoundDebtPosition.save();

  return compoundDebtPosition;
}

export function createCompoundDebtPositionChange(
  compoundDebtPositionAddress: Address,
  assetAmounts: AssetAmount[] | null,
  changeType: string,
  vault: Vault,
  event: ethereum.Event,
): CompoundDebtPositionChange {
  let change = new CompoundDebtPositionChange(uniqueEventId(event));
  change.compoundDebtPositionChangeType = changeType;
  change.externalPosition = compoundDebtPositionAddress.toHex();
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

export function trackCompoundDebtPosition(id: string, event: ethereum.Event): void {
  let cdpContract = ProtocolSdk.bind(Address.fromString(id));

  let collateral = cdpContract.getManagedAssets();
  let collateralAssetBalances = new Array<string>();
  for (let i: i32 = 0; i < collateral.value0.length; i++) {
    let address = collateral.value0[i];
    let amount = collateral.value1[i];

    let asset = ensureAsset(address);
    let assetAmount = createAssetBalance(asset, toBigDecimal(amount, asset.decimals), 'cdp', event);
    collateralAssetBalances = collateralAssetBalances.concat([assetAmount.id]);
  }

  let borrowed = cdpContract.getDebtAssets();
  let borrowedAssetBalances = new Array<string>();
  for (let i: i32 = 0; i < borrowed.value0.length; i++) {
    let address = borrowed.value0[i];
    let amount = borrowed.value1[i];

    let asset = ensureAsset(address);
    let assetAmount = createAssetBalance(asset, toBigDecimal(amount, asset.decimals), 'cdp', event);
    borrowedAssetBalances = borrowedAssetBalances.concat([assetAmount.id]);
  }

  let cdp = useCompoundDebtPosition(id);
  cdp.collateralAssetBalances = collateralAssetBalances;
  cdp.borrowedAssetBalances = borrowedAssetBalances;
  cdp.save();
}
