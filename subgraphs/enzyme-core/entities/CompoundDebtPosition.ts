import { logCritical, toBigDecimal, uniqueEventId } from '@enzymefinance/subgraph-utils';
import { Address, BigDecimal, ethereum } from '@graphprotocol/graph-ts';
import { ProtocolSdk } from '../generated/contracts/ProtocolSdk';
import {
  Asset,
  AssetAmount,
  CompoundDebtPosition,
  CompoundDebtPositionChange,
  ExternalPositionType,
  Vault,
} from '../generated/schema';
import { ensureAsset } from './Asset';
import { createAssetAmount } from './AssetAmount';
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
  compoundDebtPosition.collateralAmounts = new Array<string>();
  compoundDebtPosition.borrowedAmounts = new Array<string>();
  compoundDebtPosition.save();

  return compoundDebtPosition;
}

export function createCompoundDebtPositionChange(
  compoundDebtPositionAddress: Address,
  assetAmounts: AssetAmount[],
  changeType: string,
  vault: Vault,
  event: ethereum.Event,
): CompoundDebtPositionChange {
  let change = new CompoundDebtPositionChange(uniqueEventId(event));
  change.changeType = changeType;
  change.externalPosition = compoundDebtPositionAddress.toHex();
  change.assetAmounts = assetAmounts.map<string>((assetAmount) => assetAmount.id);
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

export function trackCompoundDebtPositionAssets(id: string, denominationAsset: Asset, event: ethereum.Event): void {
  let cdpContract = ProtocolSdk.bind(Address.fromString(id));

  let collateral = cdpContract.getManagedAssets();
  let collateralAssetAmounts = new Array<string>();
  for (let i = 0; i < collateral.value0.length; i++) {
    let address = collateral.value0[i];
    let amount = collateral.value1[i];

    let asset = ensureAsset(address);
    let assetAmount = createAssetAmount(asset, toBigDecimal(amount, asset.decimals), denominationAsset, 'cdp', event);
    collateralAssetAmounts = collateralAssetAmounts.concat([assetAmount.id]);
  }

  let borrowed = cdpContract.getDebtAssets();
  let borrowedAssetAmounts = new Array<string>();
  for (let i = 0; i < borrowed.value0.length; i++) {
    let address = borrowed.value0[i];
    let amount = borrowed.value1[i];

    let asset = ensureAsset(address);
    let assetAmount = createAssetAmount(asset, toBigDecimal(amount, asset.decimals), denominationAsset, 'cdp', event);
    borrowedAssetAmounts = borrowedAssetAmounts.concat([assetAmount.id]);
  }

  let cdp = useCompoundDebtPosition(id);
  cdp.collateralAmounts = collateralAssetAmounts;
  cdp.borrowedAmounts = borrowedAssetAmounts;
  cdp.save();
}
