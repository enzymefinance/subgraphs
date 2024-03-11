import { logCritical, toBigDecimal, uniqueEventId, ZERO_BD } from '@enzymefinance/subgraph-utils';
import { Address, ethereum, BigDecimal, BigInt } from '@graphprotocol/graph-ts';
import {
  AssetAmount,
  LiquityDebtPosition,
  LiquityDebtPositionChange,
  ExternalPositionType,
  Vault,
  Asset,
} from '../generated/schema';
import { ProtocolSdk } from '../generated/contracts/ProtocolSdk';
import { ensureAsset } from './Asset';
import { getActivityCounter } from './Counter';
import { useVault } from './Vault';
import { lusdAddress, wethTokenAddress } from '../generated/addresses';

export function useLiquityDebtPosition(id: string): LiquityDebtPosition {
  let ldp = LiquityDebtPosition.load(id);
  if (ldp == null) {
    logCritical('Failed to load LiquityDebtPosition {}.', [id]);
  }

  return ldp as LiquityDebtPosition;
}

export function createLiquityDebtPosition(
  externalPositionAddress: Address,
  vaultAddress: Address,
  type: ExternalPositionType,
): LiquityDebtPosition {
  let liquityDebtPosition = new LiquityDebtPosition(externalPositionAddress.toHex());
  liquityDebtPosition.vault = useVault(vaultAddress.toHex()).id;
  liquityDebtPosition.active = true;
  liquityDebtPosition.type = type.id;
  liquityDebtPosition.collateralBalance = ZERO_BD;
  liquityDebtPosition.borrowedBalance = ZERO_BD;
  liquityDebtPosition.save();

  return liquityDebtPosition;
}

export function createLiquityDebtPositionChange(
  liquityDebtPositionAddress: Address,
  changeType: string,
  incomingAssetAmounts: AssetAmount[],
  incomingAssets: Asset[],
  outgoingAssetAmount: AssetAmount | null,
  lusdGasCompensationAssetAmount: AssetAmount | null,
  vault: Vault,
  event: ethereum.Event,
): LiquityDebtPositionChange {
  let change = new LiquityDebtPositionChange(uniqueEventId(event));
  change.liquityDebtPositionChangeType = changeType;
  change.externalPosition = liquityDebtPositionAddress.toHex();
  change.incomingAssetAmounts = incomingAssetAmounts.map<string>((assetAmount) => assetAmount.id);
  change.incomingAssets = incomingAssets.map<string>((asset) => asset.id);
  change.outgoingAssetAmount = outgoingAssetAmount != null ? outgoingAssetAmount.id : null;
  change.lusdGasCompensationAssetAmount =
    lusdGasCompensationAssetAmount != null ? lusdGasCompensationAssetAmount.id : null;
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

export function trackLiquityDebtPosition(id: string): void {
  let ldpContract = ProtocolSdk.bind(Address.fromString(id));

  let ldp = useLiquityDebtPosition(id);

  let collateral = ldpContract.getManagedAssets();

  if (collateral.value0.length === 0) {
    ldp.collateralBalance = ZERO_BD;
  } else {
    // there is only single collateral asset (WETH)
    let collateralAmount = collateral.value1[0];
    let collateralAsset = ensureAsset(wethTokenAddress);
    ldp.collateralBalance = toBigDecimal(collateralAmount, collateralAsset.decimals);
  }

  let borrowed = ldpContract.getDebtAssets();

  if (borrowed.value0.length === 0) {
    ldp.borrowedBalance = ZERO_BD;
  } else {
    // there is only single borrowed asset (LUSD)
    let borrowedAmount = borrowed.value1[0];
    let borrowedAsset = ensureAsset(lusdAddress);
    ldp.borrowedBalance = toBigDecimal(borrowedAmount, borrowedAsset.decimals);
  }

  ldp.save();
}

export let lusdGasCompensationAmountBD = BigDecimal.fromString('200');
