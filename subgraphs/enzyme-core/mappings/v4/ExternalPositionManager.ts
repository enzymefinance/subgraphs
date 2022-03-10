import { toBigDecimal, tuplePrefixBytes } from '@enzymefinance/subgraph-utils';
import { Address, ethereum } from '@graphprotocol/graph-ts';
import {
  createAaveDebtPosition,
  createAaveDebtPositionChange,
  trackAaveDebtPositionAssets,
} from '../../entities/AaveDebtPosition';
import { ensureAsset } from '../../entities/Asset';
import { createAssetAmount } from '../../entities/AssetAmount';
import {
  createCompoundDebtPosition,
  createCompoundDebtPositionChange,
  trackCompoundDebtPositionAssets,
} from '../../entities/CompoundDebtPosition';
import { ensureComptroller } from '../../entities/Comptroller';
import { useExternalPositionType } from '../../entities/ExternalPositionType';
import { useVault } from '../../entities/Vault';
import {
  CallOnExternalPositionExecutedForFund,
  ExternalPositionDeployedForFund,
  ExternalPositionTypeInfoUpdated,
  ValidatedVaultProxySetForFund,
} from '../../generated/contracts/ExternalPositionManager4Events';
import { ProtocolSdk } from '../../generated/contracts/ProtocolSdk';
import { AssetAmount } from '../../generated/schema';
import { AaveDebtPositionActionId, CompoundDebtPositionActionId } from '../../utils/actionId';

export function handleExternalPositionDeployedForFund(event: ExternalPositionDeployedForFund): void {
  let type = useExternalPositionType(event.params.externalPositionTypeId);

  // Compound Debt Position
  if (type.label == 'COMPOUND_DEBT') {
    createCompoundDebtPosition(event.params.externalPosition, event.params.vaultProxy, type);
  }

  // Uniswap V3 Position
  if (type.label == 'UNISWAP_V3_LIQUIDITY') {
  }

  // Aave Debt Position
  if (type.label == 'AAVE_DEBT') {
    createAaveDebtPosition(event.params.externalPosition, event.params.vaultProxy, type);
  }
}

export function handleCallOnExternalPositionExecutedForFund(event: CallOnExternalPositionExecutedForFund): void {
  let comptrollerProxy = ensureComptroller(event.params.comptrollerProxy, event);

  if (comptrollerProxy.vault == null) {
    return;
  }

  let vault = useVault(comptrollerProxy.vault as string);
  let actionId = event.params.actionId.toI32();
  let denominationAsset = ensureAsset(Address.fromString(comptrollerProxy.denomination));

  let iExternalPositionProxy = ProtocolSdk.bind(event.params.externalPosition);
  let typeId = iExternalPositionProxy.getExternalPositionType();

  let type = useExternalPositionType(typeId);

  if (type.label == 'COMPOUND_DEBT') {
    let decoded = ethereum.decode('(address[],uint256[],bytes)', tuplePrefixBytes(event.params.actionArgs));

    if (decoded == null) {
      return;
    }

    let tuple = decoded.toTuple();

    let addresses = tuple[0].toAddressArray();
    let amounts = tuple[1].toBigIntArray();

    let assetAmounts: AssetAmount[] = new Array<AssetAmount>();
    for (let i = 0; i < addresses.length; i++) {
      let asset = ensureAsset(addresses[i]);
      let amount = toBigDecimal(amounts[i], asset.decimals);
      let assetAmount = createAssetAmount(asset, amount, denominationAsset, 'cdp', event);
      assetAmounts = assetAmounts.concat([assetAmount]);
    }

    if (actionId == CompoundDebtPositionActionId.AddCollateral) {
      createCompoundDebtPositionChange(event.params.externalPosition, assetAmounts, 'AddCollateral', vault, event);
    }

    if (actionId == CompoundDebtPositionActionId.RemoveCollateral) {
      createCompoundDebtPositionChange(event.params.externalPosition, assetAmounts, 'RemoveCollateral', vault, event);
    }

    if (actionId == CompoundDebtPositionActionId.Borrow) {
      createCompoundDebtPositionChange(event.params.externalPosition, assetAmounts, 'Borrow', vault, event);
    }

    if (actionId == CompoundDebtPositionActionId.RepayBorrow) {
      createCompoundDebtPositionChange(event.params.externalPosition, assetAmounts, 'RepayBorrow', vault, event);
    }

    if (actionId == CompoundDebtPositionActionId.ClaimComp) {
      // Not implemented
      // assetAmounts: rewards tokens, but we don't know the amounts
    }

    trackCompoundDebtPositionAssets(event.params.externalPosition.toHex(), denominationAsset, event);
    return;
  }

  // Aave Debt Position
  if (type.label == 'AAVE_DEBT') {
    let decoded = ethereum.decode('(address[],uint256[])', tuplePrefixBytes(event.params.actionArgs));

    if (decoded == null) {
      return;
    }

    let tuple = decoded.toTuple();

    let addresses = tuple[0].toAddressArray();
    let amounts = tuple[1].toBigIntArray();

    let assetAmounts: AssetAmount[] = new Array<AssetAmount>();
    for (let i = 0; i < addresses.length; i++) {
      let asset = ensureAsset(addresses[i]);
      let amount = toBigDecimal(amounts[i], asset.decimals);
      let assetAmount = createAssetAmount(asset, amount, denominationAsset, 'adp', event);
      assetAmounts = assetAmounts.concat([assetAmount]);
    }

    if (actionId == AaveDebtPositionActionId.AddCollateral) {
      createAaveDebtPositionChange(event.params.externalPosition, assetAmounts, 'AddCollateral', vault, event);
    }

    if (actionId == AaveDebtPositionActionId.RemoveCollateral) {
      createAaveDebtPositionChange(event.params.externalPosition, assetAmounts, 'RemoveCollateral', vault, event);
    }

    if (actionId == AaveDebtPositionActionId.Borrow) {
      createAaveDebtPositionChange(event.params.externalPosition, assetAmounts, 'Borrow', vault, event);
    }

    if (actionId == AaveDebtPositionActionId.RepayBorrow) {
      createAaveDebtPositionChange(event.params.externalPosition, assetAmounts, 'RepayBorrow', vault, event);
    }

    if (actionId == AaveDebtPositionActionId.ClaimRewards) {
      // Not implemented
      // assetAmounts: rewards tokens, but we don't know the amounts (set to zero)
    }

    trackAaveDebtPositionAssets(event.params.externalPosition.toHex(), denominationAsset, event);
    return;
  }

  // Uniswap V3 Liquidity
  // Not implemented
}

export function handleExternalPositionTypeInfoUpdated(event: ExternalPositionTypeInfoUpdated): void {}
export function handleValidatedVaultProxySetForFund(event: ValidatedVaultProxySetForFund): void {}
