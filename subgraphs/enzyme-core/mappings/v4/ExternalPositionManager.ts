import { toBigDecimal, tuplePrefixBytes } from '@enzymefinance/subgraph-utils';
import { Address, DataSourceContext, ethereum } from '@graphprotocol/graph-ts';
import {
  createAaveDebtPosition,
  createAaveDebtPositionChange,
  trackAaveDebtPosition,
} from '../../entities/AaveDebtPosition';
import { ensureAsset } from '../../entities/Asset';
import { createAssetAmount } from '../../entities/AssetAmount';
import {
  createCompoundDebtPosition,
  createCompoundDebtPositionChange,
  trackCompoundDebtPosition,
} from '../../entities/CompoundDebtPosition';
import { ensureComptroller } from '../../entities/Comptroller';
import { useExternalPositionType } from '../../entities/ExternalPositionType';
import {
  createUniswapV3LiquidityPosition,
  createUniswapV3LiquidityPositionChange,
} from '../../entities/UniswapV3LiquidityPosition';
import { trackUniswapV3Nft, useUniswapV3Nft } from '../../entities/UniswapV3Nft';
import { useVault } from '../../entities/Vault';
import {
  CallOnExternalPositionExecutedForFund,
  ExternalPositionDeployedForFund,
  ExternalPositionTypeInfoUpdated,
  ValidatedVaultProxySetForFund,
} from '../../generated/contracts/ExternalPositionManager4Events';
import { ProtocolSdk } from '../../generated/contracts/ProtocolSdk';
import { AssetAmount } from '../../generated/schema';
import { UniswapV3LiquidityPositionLib4DataSource } from '../../generated/templates';
import {
  AaveDebtPositionActionId,
  CompoundDebtPositionActionId,
  UniswapV3LiquidityPositionActionId,
} from '../../utils/actionId';

export function handleExternalPositionDeployedForFund(event: ExternalPositionDeployedForFund): void {
  let type = useExternalPositionType(event.params.externalPositionTypeId);

  // Compound Debt Position
  if (type.label == 'COMPOUND_DEBT') {
    createCompoundDebtPosition(event.params.externalPosition, event.params.vaultProxy, type);
  }

  // Aave Debt Position
  if (type.label == 'AAVE_DEBT') {
    createAaveDebtPosition(event.params.externalPosition, event.params.vaultProxy, type);
  }

  // Uniswap V3 Position
  if (type.label == 'UNISWAP_V3_LIQUIDITY') {
    createUniswapV3LiquidityPosition(event.params.externalPosition, event.params.vaultProxy, type);

    let context = new DataSourceContext();
    context.setString('vaultProxy', event.params.vaultProxy.toHex());
    UniswapV3LiquidityPositionLib4DataSource.createWithContext(event.params.externalPosition, context);
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
      createCompoundDebtPositionChange(event.params.externalPosition, null, 'ClaimComp', vault, event);
    }

    trackCompoundDebtPosition(event.params.externalPosition.toHex(), event);
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
      createAaveDebtPositionChange(event.params.externalPosition, null, 'ClaimRewards', vault, event);
    }

    trackAaveDebtPosition(event.params.externalPosition.toHex(), event);
  }

  // Uniswap V3 Liquidity
  if (type.label == 'UNISWAP_V3_LIQUIDITY') {
    if (actionId == UniswapV3LiquidityPositionActionId.Mint) {
      let decoded = ethereum.decode(
        '(address,address,uint24,int24,int24,uint256,uint256,uint256,uint256)',
        event.params.actionArgs,
      );

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();

      let asset0 = ensureAsset(tuple[0].toAddress());
      let amount0 = toBigDecimal(tuple[5].toBigInt(), asset0.decimals);
      let assetAmount0 = createAssetAmount(asset0, amount0, denominationAsset, 'uv3lp', event);

      let asset1 = ensureAsset(tuple[1].toAddress());
      let amount1 = toBigDecimal(tuple[6].toBigInt(), asset1.decimals);
      let assetAmount1 = createAssetAmount(asset1, amount1, denominationAsset, 'uv3lp', event);

      createUniswapV3LiquidityPositionChange(
        event.params.externalPosition,
        null,
        [assetAmount0, assetAmount1],
        null,
        'Mint',
        vault,
        event,
      );
    }

    if (actionId == UniswapV3LiquidityPositionActionId.AddLiquidity) {
      let decoded = ethereum.decode('(uint256,uint256,uint256,uint256,uint256)', event.params.actionArgs);

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();

      let nftId = tuple[0].toBigInt();

      let nft = useUniswapV3Nft(nftId);

      let asset0 = ensureAsset(Address.fromString(nft.token0));
      let amount0 = toBigDecimal(tuple[1].toBigInt(), asset0.decimals);
      let assetAmount0 = createAssetAmount(asset0, amount0, denominationAsset, 'uv3lp', event);

      let asset1 = ensureAsset(Address.fromString(nft.token1));
      let amount1 = toBigDecimal(tuple[2].toBigInt(), asset1.decimals);
      let assetAmount1 = createAssetAmount(asset1, amount1, denominationAsset, 'uv3lp', event);

      createUniswapV3LiquidityPositionChange(
        event.params.externalPosition,
        nft,
        [assetAmount0, assetAmount1],
        null,
        'AddLiquidity',
        vault,
        event,
      );

      let nonFungiblePositionManagerAddress = iExternalPositionProxy.getNonFungibleTokenManager();

      trackUniswapV3Nft(nftId, nonFungiblePositionManagerAddress);
    }

    if (actionId == UniswapV3LiquidityPositionActionId.RemoveLiquidity) {
      let decoded = ethereum.decode('(uint256,uint128,uint256,uint256)', event.params.actionArgs);

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();

      let nftId = tuple[0].toBigInt();
      let liquidity = tuple[1].toBigInt();

      createUniswapV3LiquidityPositionChange(
        event.params.externalPosition,
        useUniswapV3Nft(nftId),
        null,
        liquidity,
        'RemoveLiquidity',
        vault,
        event,
      );

      let nonFungiblePositionManagerAddress = iExternalPositionProxy.getNonFungibleTokenManager();

      trackUniswapV3Nft(nftId, nonFungiblePositionManagerAddress);
    }

    if (actionId == UniswapV3LiquidityPositionActionId.Collect) {
      let decoded = ethereum.decode('(uint256)', event.params.actionArgs);

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();

      let nftId = tuple[0].toBigInt();

      createUniswapV3LiquidityPositionChange(
        event.params.externalPosition,
        useUniswapV3Nft(nftId),
        null,
        null,
        'Collect',
        vault,
        event,
      );

      let nonFungiblePositionManagerAddress = iExternalPositionProxy.getNonFungibleTokenManager();

      trackUniswapV3Nft(nftId, nonFungiblePositionManagerAddress);
    }

    if (actionId == UniswapV3LiquidityPositionActionId.Purge) {
      let decoded = ethereum.decode('(uint256,uint128,uint256,uint256)', event.params.actionArgs);

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();

      let nftId = tuple[0].toBigInt();
      let liquidity = tuple[1].toBigInt();

      createUniswapV3LiquidityPositionChange(
        event.params.externalPosition,
        useUniswapV3Nft(nftId),
        null,
        liquidity,
        'Purge',
        vault,
        event,
      );

      // Do not call trackUniswapV3Nft() for purge (nft will not exist onchain after purge)
    }

    return;
  }
}

export function handleExternalPositionTypeInfoUpdated(event: ExternalPositionTypeInfoUpdated): void {}
export function handleValidatedVaultProxySetForFund(event: ValidatedVaultProxySetForFund): void {}
