import { logCritical, toBigDecimal, uniqueEventId } from '@enzymefinance/subgraph-utils';
import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts';
import { CompoundDebtPositionLib4Contract } from '../generated/CompoundDebtPositionLib4Contract';
import { CompoundDebtPosition, CompoundDebtPositionChange } from '../generated/schema';
import { ensureAsset } from './Asset';
import { createAssetAmount } from './AssetAmount';
import { useVault } from './Vault';

export function useCompoundDebtPosition(id: string): CompoundDebtPosition {
  let cdp = CompoundDebtPosition.load(id) as CompoundDebtPosition;
  if (cdp == null) {
    logCritical('Failed to load fund {}.', [id]);
  }

  return cdp;
}

export function createCompoundDebtPosition(
  externalPositionAddress: Address,
  vaultAddress: Address,
  type: i32,
): CompoundDebtPosition {
  let compoundDebtPosition = new CompoundDebtPosition(externalPositionAddress.toHex());
  compoundDebtPosition.vault = useVault(vaultAddress.toHex()).id;
  compoundDebtPosition.active = true;
  compoundDebtPosition.type = type;
  compoundDebtPosition.collateralAmounts = new Array<string>();
  compoundDebtPosition.borrowedAmounts = new Array<string>();
  compoundDebtPosition.save();

  return compoundDebtPosition;
}

export function createCompoundDebtPositionChange(
  compoundDebtPositionAddress: Address,
  assetAddress: Address,
  amount: BigInt,
  changeType: string,
  event: ethereum.Event,
): CompoundDebtPositionChange {
  let asset = ensureAsset(assetAddress);
  let assetAmount = createAssetAmount(asset, toBigDecimal(amount, asset.decimals), 'cdp' + changeType, event);

  let change = new CompoundDebtPositionChange(uniqueEventId(event));
  change.changeType = changeType;
  change.externalPosition = compoundDebtPositionAddress.toHex();
  change.assetAmount = assetAmount.id;
  change.save();

  return change;
}

export function trackCompoundDebtPositionAssets(id: string, event: ethereum.Event): void {
  let cdpContract = CompoundDebtPositionLib4Contract.bind(Address.fromString(id));

  let collateral = cdpContract.getManagedAssets();
  let collateralAssetAmounts = new Array<string>();
  for (let i = 0; i < collateral.value0.length; i++) {
    let address = collateral.value0[i];
    let amount = collateral.value1[i];

    let asset = ensureAsset(address);
    let assetAmount = createAssetAmount(asset, toBigDecimal(amount, asset.decimals), 'cdp', event);
    collateralAssetAmounts = collateralAssetAmounts.concat([assetAmount.id]);
  }

  let borrowed = cdpContract.getDebtAssets();
  let borrowedAssetAmounts = new Array<string>();
  for (let i = 0; i < borrowed.value0.length; i++) {
    let address = borrowed.value0[i];
    let amount = borrowed.value1[i];

    let asset = ensureAsset(address);
    let assetAmount = createAssetAmount(asset, toBigDecimal(amount, asset.decimals), 'cdp', event);
    borrowedAssetAmounts = borrowedAssetAmounts.concat([assetAmount.id]);
  }

  let cdp = useCompoundDebtPosition(id);
  cdp.collateralAmounts = collateralAssetAmounts;
  cdp.borrowedAmounts = borrowedAssetAmounts;
  cdp.save();
}
