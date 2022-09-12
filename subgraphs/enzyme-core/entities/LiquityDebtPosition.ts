import { logCritical, toBigDecimal, uniqueEventId } from '@enzymefinance/subgraph-utils';
import { Address, ethereum, BigDecimal, BigInt } from '@graphprotocol/graph-ts';
import {
  AssetAmount,
  LiquityDebtPosition,
  LiquityDebtPositionChange,
  ExternalPositionType,
  Vault,
} from '../generated/schema';
import { ProtocolSdk } from '../generated/contracts/ProtocolSdk';
import { ensureAsset } from './Asset';
import { createAssetBalance } from './AssetBalance';
import { getActivityCounter } from './Counter';
import { useVault } from './Vault';

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
  liquityDebtPosition.troveIsOpen = false;
  liquityDebtPosition.type = type.id;
  liquityDebtPosition.collateralAssetBalance = null;
  liquityDebtPosition.borrowedAssetBalance = null;
  liquityDebtPosition.save();

  return liquityDebtPosition;
}

export function createLiquityDebtPositionChange(
  liquityDebtPositionAddress: Address,
  changeType: string,
  incomingAssetAmounts: AssetAmount[],
  outgoingAssetAmount: AssetAmount | null,
  lusdGasCompensationAssetAmount: AssetAmount | null,
  feeAssetAmount: AssetAmount | null,
  vault: Vault,
  event: ethereum.Event,
): LiquityDebtPositionChange {
  let change = new LiquityDebtPositionChange(uniqueEventId(event));
  change.liquityDebtPositionChangeType = changeType;
  change.externalPosition = liquityDebtPositionAddress.toHex();
  change.incomingAssetAmounts = incomingAssetAmounts.map<string>((assetAmount) => assetAmount.id);
  change.outgoingAssetAmount = outgoingAssetAmount != null ? outgoingAssetAmount.id : null;
  change.lusdGasCompensationAssetAmount =
    lusdGasCompensationAssetAmount != null ? lusdGasCompensationAssetAmount.id : null;
  change.feeAssetAmount = feeAssetAmount != null ? feeAssetAmount.id : null;
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

export function getLiquityDebtPositionBorrowedAmount(id: string): BigInt | null {
  let ldpContract = ProtocolSdk.bind(Address.fromString(id));

  let borrowed = ldpContract.getDebtAssets();

  if (borrowed.value0.length === 0) {
    return null;
  }
  return borrowed.value1[0];
}

export function trackLiquityDebtPosition(id: string, troveIsOpen: boolean, event: ethereum.Event): void {
  let ldpContract = ProtocolSdk.bind(Address.fromString(id));

  let ldp = useLiquityDebtPosition(id);

  let collateral = ldpContract.getManagedAssets();

  if (collateral.value0.length === 0) {
    ldp.collateralAssetBalance = null;
  } else {
    // there is only single collateral asset (WETH)
    let collateralAddress = collateral.value0[0];
    let collateralAmount = collateral.value1[0];

    let collateralAsset = ensureAsset(collateralAddress);
    let collateralAssetBalance = createAssetBalance(
      collateralAsset,
      toBigDecimal(collateralAmount, collateralAsset.decimals),
      'ldp-collateral-asset-balance',
      event,
    );
    ldp.collateralAssetBalance = collateralAssetBalance.id;
  }

  let borrowed = ldpContract.getDebtAssets();

  if (borrowed.value0.length === 0) {
    ldp.borrowedAssetBalance = null;
  } else {
    // there is only single borrowed asset (LUSD)
    let borrowedAddress = borrowed.value0[0];
    let borrowedAmount = borrowed.value1[0];

    let borrowedAsset = ensureAsset(borrowedAddress);
    let borrowedAssetBalance = createAssetBalance(
      borrowedAsset,
      toBigDecimal(borrowedAmount, borrowedAsset.decimals),
      'ldp-borrowed-asset-balance',
      event,
    );
    ldp.borrowedAssetBalance = borrowedAssetBalance.id;
  }

  ldp.troveIsOpen = troveIsOpen;
  ldp.save();
}

export let lusdGasCompensationAmountBD = BigDecimal.fromString('200');
