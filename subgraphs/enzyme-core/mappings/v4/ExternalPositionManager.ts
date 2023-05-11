import {
  arrayUnique,
  logCritical,
  toBigDecimal,
  tuplePrefixBytes,
  ZERO_ADDRESS,
  ZERO_BD,
  ZERO_BI,
} from '@enzymefinance/subgraph-utils';
import { Address, Bytes, DataSourceContext, ethereum, crypto, BigInt, BigDecimal } from '@graphprotocol/graph-ts';
import { createAaveDebtPosition, createAaveDebtPositionChange } from '../../entities/AaveDebtPosition';
import {
  createMapleLiquidityAssetAmountV1,
  createMapleLiquidityAssetAmountByPoolTokenAmountV1,
  createMapleLiquidityAssetAmountByRedeemedPoolTokenAmountV2,
  createMapleLiquidityPosition,
  createMapleLiquidityPositionChange,
  createMapleLiquidityAssetAmountV2,
  createMapleLiquidityAssetAmountByPoolTokenAmountV2,
} from '../../entities/MapleLiquidityPosition';
import {
  createLiquityDebtPosition,
  createLiquityDebtPositionChange,
  getLiquityDebtPositionBorrowedAmount,
  lusdGasCompensationAmountBD,
  trackLiquityDebtPosition,
  useLiquityDebtPosition,
} from '../../entities/LiquityDebtPosition';
import { ensureAsset } from '../../entities/Asset';
import { createAssetAmount } from '../../entities/AssetAmount';
import { createCompoundDebtPosition, createCompoundDebtPositionChange } from '../../entities/CompoundDebtPosition';
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
import { Asset, AssetAmount, KilnStaking, KilnStakingPosition } from '../../generated/schema';
import {
  ArbitraryLoanPositionLib4DataSource,
  KilnStaking4DataSource,
  MapleLiquidityPositionLib4DataSource,
  TheGraphDelegationPositionLib4DataSource,
  UniswapV3LiquidityPositionLib4DataSource,
} from '../../generated/templates';
import {
  AaveDebtPositionActionId,
  ArbitraryLoanPositionActionId,
  CompoundDebtPositionActionId,
  ConvexVotingPositionActionId,
  MapleLiquidityPositionActionId,
  TheGraphDelegationPositionActionId,
  LiquityDebtPositionActionId,
  UniswapV3LiquidityPositionActionId,
  KilnStakingPositionActionId,
} from '../../utils/actionId';
import { ensureMapleLiquidityPoolV1, ensureMapleLiquidityPoolV2 } from '../../entities/MapleLiquidityPool';
import { ExternalSdk } from '../../generated/contracts/ExternalSdk';
import {
  createConvexVotingPosition,
  createConvexVotingPositionChange,
  updateConvexVotingPositionUserLocks,
  updateConvexVotingPositionWithdrawOrRelock,
  useConvexVotingPosition,
} from '../../entities/ConvexVotingPosition';
import { cvxAddress, lusdAddress, grtAddress, wethTokenAddress, mplAddress } from '../../generated/addresses';
import {
  createTheGraphDelegationPosition,
  createTheGraphDelegationPositionChange,
  getDelegationTaxPercentage,
  sharesToTheGraphAssetAmount,
} from '../../entities/TheGraphDelegationPosition';
import {
  createUnknownExternalPosition,
  createUnknownExternalPositionChange,
} from '../../entities/UnknownExternalPosition';
import {
  createArbitraryLoanPosition,
  createArbitraryLoanPositionChange,
  useArbitraryLoanPosition,
} from '../../entities/ArbitraryLoanPosition';
import {
  trackTheGraphDelegationToIndexer,
  getTheGraphDelegationToIndexerId,
  useTheGraphDelegationToIndexer,
} from '../../entities/TheGraphDelegationToIndexer';
import {
  createKilnStakingPosition,
  createKilnStakingPositionChange,
  ensureKilnStaking,
  useKilnStakingPosition,
} from '../../entities/KilnStakingPosition';
import { kilnClaimFeeType } from '../../utils/kilnClaimFeeType';

export function handleExternalPositionDeployedForFund(event: ExternalPositionDeployedForFund): void {
  let type = useExternalPositionType(event.params.externalPositionTypeId);

  if (type.label == 'COMPOUND_DEBT') {
    createCompoundDebtPosition(event.params.externalPosition, event.params.vaultProxy, type);
    return;
  }

  if (type.label == 'AAVE_DEBT') {
    createAaveDebtPosition(event.params.externalPosition, event.params.vaultProxy, type);
    return;
  }

  if (type.label == 'UNISWAP_V3_LIQUIDITY') {
    createUniswapV3LiquidityPosition(event.params.externalPosition, event.params.vaultProxy, type);

    let context = new DataSourceContext();
    context.setString('vaultProxy', event.params.vaultProxy.toHex());
    UniswapV3LiquidityPositionLib4DataSource.createWithContext(event.params.externalPosition, context);
    return;
  }

  if (type.label == 'MAPLE_LIQUIDITY') {
    createMapleLiquidityPosition(event.params.externalPosition, event.params.vaultProxy, type);

    MapleLiquidityPositionLib4DataSource.create(event.params.externalPosition);
    return;
  }

  if (type.label == 'LIQUITY_DEBT') {
    createLiquityDebtPosition(event.params.externalPosition, event.params.vaultProxy, type);
    return;
  }

  if (type.label == 'CONVEX_VOTING') {
    createConvexVotingPosition(event.params.externalPosition, event.params.vaultProxy, type);
    return;
  }

  if (type.label == 'ARBITRARY_LOAN') {
    createArbitraryLoanPosition(event.params.externalPosition, event.params.vaultProxy, type);

    ArbitraryLoanPositionLib4DataSource.create(event.params.externalPosition);

    return;
  }

  if (type.label == 'THEGRAPH_DELEGATION') {
    createTheGraphDelegationPosition(event.params.externalPosition, event.params.vaultProxy, type);

    TheGraphDelegationPositionLib4DataSource.create(event.params.externalPosition);

    return;
  }

  if (type.label == 'KILN_STAKING') {
    createKilnStakingPosition(event.params.externalPosition, event.params.vaultProxy, type);

    return;
  }

  createUnknownExternalPosition(event.params.externalPosition, event.params.vaultProxy, type);
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

    return;
  }

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

    return;
  }

  if (type.label == 'UNISWAP_V3_LIQUIDITY') {
    if (actionId == UniswapV3LiquidityPositionActionId.Mint) {
      // We are NOT tracking the position change here, because we do not know the nftId. Instead,
      // the position change is tracked in the NFTPositionAdded event in the UniswapV3LiquidityPositionLib
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
      return;
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

      let nonFungiblePositionManagerAddress = iExternalPositionProxy.getNonFungibleTokenManager();

      trackUniswapV3Nft(nftId, nonFungiblePositionManagerAddress);
    }

    return;
  }

  if (type.label == 'LIQUITY_DEBT') {
    if (actionId == LiquityDebtPositionActionId.OpenTrove) {
      let decoded = ethereum.decode('(uint256,uint256,uint256,address,address)', event.params.actionArgs);

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();

      let wethAsset = ensureAsset(wethTokenAddress);
      let wethAmount = toBigDecimal(tuple[1].toBigInt(), wethAsset.decimals);
      let outgoingAsset = createAssetAmount(wethAsset, wethAmount, denominationAsset, 'ldp-outgoing', event);

      let lusdAsset = ensureAsset(lusdAddress);
      let lusdAmount = toBigDecimal(tuple[2].toBigInt(), lusdAsset.decimals);
      let incomingAsset = createAssetAmount(lusdAsset, lusdAmount, denominationAsset, 'ldp-incoming', event);

      let lusdGasCompensationAssetAmount = createAssetAmount(
        lusdAsset,
        lusdGasCompensationAmountBD,
        denominationAsset,
        'ldp-lusd-gas-compensation',
        event,
      );

      let borrowedAmount = getLiquityDebtPositionBorrowedAmount(event.params.externalPosition.toHex());

      let feeAmount = borrowedAmount.minus(lusdAmount).minus(lusdGasCompensationAmountBD);
      let feeAssetAmount = createAssetAmount(lusdAsset, feeAmount, denominationAsset, 'ldp-fee', event);

      createLiquityDebtPositionChange(
        event.params.externalPosition,
        'OpenTrove',
        [incomingAsset],
        outgoingAsset,
        lusdGasCompensationAssetAmount,
        feeAssetAmount,
        vault,
        event,
      );
    }

    if (actionId == LiquityDebtPositionActionId.AddCollateral) {
      let decoded = ethereum.decode('(uint256,address,address)', event.params.actionArgs);

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();

      let wethAsset = ensureAsset(wethTokenAddress);
      let wethAmount = toBigDecimal(tuple[0].toBigInt(), wethAsset.decimals);

      let outgoingAsset = createAssetAmount(wethAsset, wethAmount, denominationAsset, 'ldp-outgoing', event);

      createLiquityDebtPositionChange(
        event.params.externalPosition,
        'AddCollateral',
        [],
        outgoingAsset,
        null,
        null,
        vault,
        event,
      );
    }

    if (actionId == LiquityDebtPositionActionId.RemoveCollateral) {
      let decoded = ethereum.decode('(uint256,address,address)', event.params.actionArgs);

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();

      let wethAsset = ensureAsset(wethTokenAddress);
      let wethAmount = toBigDecimal(tuple[0].toBigInt(), wethAsset.decimals);

      let incomingAsset = createAssetAmount(wethAsset, wethAmount, denominationAsset, 'ldp-incoming', event);

      createLiquityDebtPositionChange(
        event.params.externalPosition,
        'RemoveCollateral',
        [incomingAsset],
        null,
        null,
        null,
        vault,
        event,
      );
    }

    if (actionId == LiquityDebtPositionActionId.Borrow) {
      let decoded = ethereum.decode('(uint256,uint256,address,address)', event.params.actionArgs);

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();

      let lusdAsset = ensureAsset(lusdAddress);
      let lusdAmount = toBigDecimal(tuple[1].toBigInt(), lusdAsset.decimals);

      let incomingAsset = createAssetAmount(lusdAsset, lusdAmount, denominationAsset, 'ldp-incoming', event);

      let ldp = useLiquityDebtPosition(event.params.externalPosition.toHex());

      let borrowedBalance = ldp.borrowedBalance;
      let borrowedAmount = getLiquityDebtPositionBorrowedAmount(event.params.externalPosition.toHex());
      let feeAmount = borrowedAmount.minus(lusdAmount).minus(borrowedBalance);
      let feeAssetAmount = createAssetAmount(lusdAsset, feeAmount, denominationAsset, 'ldp-fee-asset-amount', event);

      createLiquityDebtPositionChange(
        event.params.externalPosition,
        'Borrow',
        [incomingAsset],
        null,
        null,
        feeAssetAmount,
        vault,
        event,
      );
    }

    if (actionId == LiquityDebtPositionActionId.Repay) {
      let decoded = ethereum.decode('(uint256,address,address)', event.params.actionArgs);

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();

      let lusdAsset = ensureAsset(lusdAddress);
      let lusdAmount = toBigDecimal(tuple[0].toBigInt(), lusdAsset.decimals);

      let outgoingAsset = createAssetAmount(lusdAsset, lusdAmount, denominationAsset, 'ldp-outgoing', event);

      createLiquityDebtPositionChange(
        event.params.externalPosition,
        'Repay',
        [],
        outgoingAsset,
        null,
        null,
        vault,
        event,
      );
    }

    if (actionId == LiquityDebtPositionActionId.CloseTrove) {
      let ldp = useLiquityDebtPosition(event.params.externalPosition.toHex());

      let lusdAsset = ensureAsset(lusdAddress);
      let lusdGasCompensationAssetAmount = createAssetAmount(
        lusdAsset,
        lusdGasCompensationAmountBD,
        denominationAsset,
        'ldp-lusd-gas-compensation',
        event,
      );

      let wethAsset = ensureAsset(wethTokenAddress);
      let collateralAssetAmount = createAssetAmount(
        wethAsset,
        ldp.collateralBalance,
        denominationAsset,
        'ldp-collateral',
        event,
      );

      let borrowedAssetAmount = createAssetAmount(
        lusdAsset,
        ldp.borrowedBalance,
        denominationAsset,
        'ldp-outgoing',
        event,
      );

      createLiquityDebtPositionChange(
        event.params.externalPosition,
        'CloseTrove',
        [collateralAssetAmount, lusdGasCompensationAssetAmount],
        borrowedAssetAmount,
        null,
        null,
        vault,
        event,
      );
    }

    trackLiquityDebtPosition(event.params.externalPosition.toHex());
    return;
  }

  if (type.label == 'MAPLE_LIQUIDITY') {
    if (actionId == MapleLiquidityPositionActionId.LendV1) {
      let decoded = ethereum.decode('(address,uint256)', event.params.actionArgs);

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();

      let poolAddress = tuple[0].toAddress();

      let pool = ensureMapleLiquidityPoolV1(poolAddress, null);

      let assetAmount = createMapleLiquidityAssetAmountV1(pool, tuple[1].toBigInt(), denominationAsset, event);
      let asset = ensureAsset(Address.fromString(assetAmount.asset));

      createMapleLiquidityPositionChange(
        event.params.externalPosition,
        pool,
        null,
        assetAmount,
        asset,
        'LendV1',
        vault,
        event,
      );
    }

    if (actionId == MapleLiquidityPositionActionId.LendAndStakeV1) {
      let decoded = ethereum.decode('(address,address,uint256)', event.params.actionArgs);

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();

      let poolAddress = tuple[0].toAddress();
      let rewardsContractAddress = tuple[1].toAddress();

      let pool = ensureMapleLiquidityPoolV1(poolAddress, rewardsContractAddress);
      let assetAmount = createMapleLiquidityAssetAmountV1(pool, tuple[2].toBigInt(), denominationAsset, event);
      let asset = ensureAsset(Address.fromString(assetAmount.asset));

      createMapleLiquidityPositionChange(
        event.params.externalPosition,
        pool,
        null,
        assetAmount,
        asset,
        'LendAndStakeV1',
        vault,
        event,
      );
    }

    if (actionId == MapleLiquidityPositionActionId.IntendToRedeemV1) {
      let decoded = ethereum.decode('(address)', event.params.actionArgs);

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();

      let poolAddress = tuple[0].toAddress();

      let pool = ensureMapleLiquidityPoolV1(poolAddress, null);
      createMapleLiquidityPositionChange(
        event.params.externalPosition,
        pool,
        null,
        null,
        null,
        'IntendToRedeemV1',
        vault,
        event,
      );
    }

    if (actionId == MapleLiquidityPositionActionId.RedeemV1) {
      let decoded = ethereum.decode('(address,uint256)', event.params.actionArgs);

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();

      let poolAddress = tuple[0].toAddress();

      let pool = ensureMapleLiquidityPoolV1(poolAddress, null);
      let assetAmount = createMapleLiquidityAssetAmountV1(pool, tuple[1].toBigInt(), denominationAsset, event);
      let asset = ensureAsset(Address.fromString(assetAmount.asset));

      createMapleLiquidityPositionChange(
        event.params.externalPosition,
        pool,
        null,
        assetAmount,
        asset,
        'RedeemV1',
        vault,
        event,
      );
    }

    if (actionId == MapleLiquidityPositionActionId.StakeV1) {
      let decoded = ethereum.decode('(address,address,uint256)', event.params.actionArgs);

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();

      let rewardsContractAddress = tuple[0].toAddress();
      let poolAddress = tuple[1].toAddress();

      let pool = ensureMapleLiquidityPoolV1(poolAddress, rewardsContractAddress);
      let assetAmount = createMapleLiquidityAssetAmountV1(pool, tuple[2].toBigInt(), denominationAsset, event);
      let asset = ensureAsset(Address.fromString(assetAmount.asset));

      createMapleLiquidityPositionChange(
        event.params.externalPosition,
        pool,
        null,
        assetAmount,
        asset,
        'StakeV1',
        vault,
        event,
      );
    }

    if (actionId == MapleLiquidityPositionActionId.UnstakeV1) {
      let decoded = ethereum.decode('(address,uint256)', event.params.actionArgs);

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();

      let rewardsContractAddress = tuple[0].toAddress();

      let rewardsContract = ExternalSdk.bind(rewardsContractAddress);
      let poolAddress = rewardsContract.stakingToken();

      let pool = ensureMapleLiquidityPoolV1(poolAddress, rewardsContractAddress);
      let assetAmount = createMapleLiquidityAssetAmountByPoolTokenAmountV1(
        pool,
        tuple[1].toBigInt(),
        denominationAsset,
        event,
      );
      let asset = ensureAsset(Address.fromString(assetAmount.asset));

      createMapleLiquidityPositionChange(
        event.params.externalPosition,
        pool,
        null,
        assetAmount,
        asset,
        'UnstakeV1',
        vault,
        event,
      );
    }

    if (actionId == MapleLiquidityPositionActionId.UnstakeAndRedeemV1) {
      let decoded = ethereum.decode('(address,address,uint256)', event.params.actionArgs);

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();

      let poolAddress = tuple[0].toAddress();
      let rewardsContractAddress = tuple[1].toAddress();

      let pool = ensureMapleLiquidityPoolV1(poolAddress, rewardsContractAddress);
      let assetAmount = createMapleLiquidityAssetAmountByPoolTokenAmountV1(
        pool,
        tuple[2].toBigInt(),
        denominationAsset,
        event,
      );
      let asset = ensureAsset(Address.fromString(assetAmount.asset));

      createMapleLiquidityPositionChange(
        event.params.externalPosition,
        pool,
        null,
        assetAmount,
        asset,
        'UnstakeAndRedeemV1',
        vault,
        event,
      );
    }

    if (actionId == MapleLiquidityPositionActionId.ClaimInterestV1) {
      let decoded = ethereum.decode('(address)', event.params.actionArgs);

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();

      let pool = ensureMapleLiquidityPoolV1(tuple[0].toAddress(), null);
      let liquidityAsset = ensureAsset(Address.fromString(pool.liquidityAsset));

      createMapleLiquidityPositionChange(
        event.params.externalPosition,
        pool,
        null,
        null,
        liquidityAsset,
        'ClaimInterestV1',
        vault,
        event,
      );
    }

    if (actionId == MapleLiquidityPositionActionId.ClaimRewardsV1) {
      let decoded = ethereum.decode('(address)', event.params.actionArgs);

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();

      let rewardsContractAddress = tuple[0].toAddress();

      let rewardsContract = ExternalSdk.bind(rewardsContractAddress);
      let poolAddress = rewardsContract.stakingToken();

      let pool = ensureMapleLiquidityPoolV1(poolAddress, rewardsContractAddress);

      let mplAsset = ensureAsset(mplAddress);

      createMapleLiquidityPositionChange(
        event.params.externalPosition,
        pool,
        null,
        null,
        mplAsset,
        'ClaimRewardsV1',
        vault,
        event,
      );
    }

    // if (actionId == MapleLiquidityPositionActionId.LendV2) {
    //   let decoded = ethereum.decode('(address,uint256)', event.params.actionArgs);

    //   if (decoded == null) {
    //     return;
    //   }

    //   let tuple = decoded.toTuple();

    //   let poolContractAddress = tuple[0].toAddress();

    //   let liquidityAssetAmount = tuple[1].toBigInt();

    //   let pool = ensureMapleLiquidityPoolV2(poolContractAddress);
    //   let assetAmount = createMapleLiquidityAssetAmountV2(pool, liquidityAssetAmount, denominationAsset, event);

    //   let asset = ensureAsset(Address.fromString(assetAmount.asset));

    //   createMapleLiquidityPositionChange(
    //     event.params.externalPosition,
    //     null,
    //     pool,
    //     assetAmount,
    //     asset,
    //     'LendV2',
    //     vault,
    //     event,
    //   );
    // }

    if (actionId == MapleLiquidityPositionActionId.RequestRedeemV2) {
      let decoded = ethereum.decode('(address,uint256)', event.params.actionArgs);

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();

      let poolContractAddress = tuple[0].toAddress();

      let poolTokenAmount = tuple[1].toBigInt();

      let pool = ensureMapleLiquidityPoolV2(poolContractAddress);

      let assetAmount = createMapleLiquidityAssetAmountByPoolTokenAmountV2(
        pool,
        poolTokenAmount,
        denominationAsset,
        event,
      );
      let asset = ensureAsset(Address.fromString(assetAmount.asset));

      createMapleLiquidityPositionChange(
        event.params.externalPosition,
        null,
        pool,
        assetAmount,
        asset,
        'RequestRedeemV2',
        vault,
        event,
      );
    }

    if (actionId == MapleLiquidityPositionActionId.RedeemV2) {
      let decoded = ethereum.decode('(address,uint256)', event.params.actionArgs);

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();

      let poolContractAddress = tuple[0].toAddress();

      let poolTokenAmount = tuple[1].toBigInt();

      let pool = ensureMapleLiquidityPoolV2(poolContractAddress);

      let assetAmount = createMapleLiquidityAssetAmountByRedeemedPoolTokenAmountV2(
        event.params.externalPosition,
        pool,
        poolTokenAmount,
        denominationAsset,
        event,
      );

      let asset = ensureAsset(Address.fromString(assetAmount.asset));

      createMapleLiquidityPositionChange(
        event.params.externalPosition,
        null,
        pool,
        assetAmount,
        asset,
        'RedeemV2',
        vault,
        event,
      );
    }

    if (actionId == MapleLiquidityPositionActionId.CancelRedeemV2) {
      let decoded = ethereum.decode('(address,uint256)', event.params.actionArgs);

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();

      let poolContractAddress = tuple[0].toAddress();

      let poolTokenAmount = tuple[1].toBigInt();

      let pool = ensureMapleLiquidityPoolV2(poolContractAddress);

      let assetAmount = createMapleLiquidityAssetAmountByPoolTokenAmountV2(
        pool,
        poolTokenAmount,
        denominationAsset,
        event,
      );
      let asset = ensureAsset(Address.fromString(assetAmount.asset));

      createMapleLiquidityPositionChange(
        event.params.externalPosition,
        null,
        pool,
        assetAmount,
        asset,
        'CancelRedeemV2',
        vault,
        event,
      );
    }

    return;
  }

  if (type.label == 'THEGRAPH_DELEGATION') {
    if (actionId == TheGraphDelegationPositionActionId.Delegate) {
      let decoded = ethereum.decode('(address,uint256)', event.params.actionArgs);

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();

      let indexer = tuple[0].toAddress();
      let grtAmount = tuple[1].toBigInt();

      let grtAsset = ensureAsset(grtAddress);

      let grtAmountBD = toBigDecimal(grtAmount, grtAsset.decimals);

      let feeAmount = grtAmountBD.times(getDelegationTaxPercentage());

      let grtAmountWithoutFee = grtAmountBD.minus(feeAmount);

      let grtAssetAmountWithoutFee = createAssetAmount(
        grtAsset,
        grtAmountWithoutFee,
        denominationAsset,
        'grt-asset-amount',
        event,
      );

      let feeAssetAmount = createAssetAmount(grtAsset, feeAmount, denominationAsset, 'grt-fee-asset-amount', event);

      createTheGraphDelegationPositionChange(
        event.params.externalPosition,
        grtAssetAmountWithoutFee,
        indexer,
        feeAssetAmount,
        null,
        null,
        'Delegate',
        vault,
        event,
      );

      trackTheGraphDelegationToIndexer(event.params.externalPosition, indexer, event);
    }

    if (actionId == TheGraphDelegationPositionActionId.Undelegate) {
      let decoded = ethereum.decode('(address,uint256)', event.params.actionArgs);

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();

      let indexer = tuple[0].toAddress();
      let shares = tuple[1].toBigInt();

      let theGraphDelegationToIndexerId = getTheGraphDelegationToIndexerId(event.params.externalPosition, indexer);

      let beforeUndelegateTokensLocked = useTheGraphDelegationToIndexer(theGraphDelegationToIndexerId).tokensLocked;

      let afterUndelegateGraphDelegationToIndexer = trackTheGraphDelegationToIndexer(
        event.params.externalPosition,
        indexer,
        event,
      );

      let afterUndelegateTokensLocked = afterUndelegateGraphDelegationToIndexer.tokensLocked;

      let grtAsset = ensureAsset(grtAddress);

      let grtAmount = sharesToTheGraphAssetAmount(shares, indexer, denominationAsset, event);

      let withdrewWhileUndelegatingAssetAmountBD = beforeUndelegateTokensLocked
        .plus(grtAmount.amount)
        .minus(afterUndelegateTokensLocked);

      let withdrewWhileUndelegatingAssetAmount = withdrewWhileUndelegatingAssetAmountBD.gt(BigDecimal.fromString('0'))
        ? createAssetAmount(
            grtAsset,
            withdrewWhileUndelegatingAssetAmountBD,
            denominationAsset,
            'grt-withdrew-while-undelegating-asset-amount',
            event,
          )
        : null;

      createTheGraphDelegationPositionChange(
        event.params.externalPosition,
        grtAmount,
        indexer,
        null,
        null,
        withdrewWhileUndelegatingAssetAmount,
        'Undelegate',
        vault,
        event,
      );
    }

    if (actionId == TheGraphDelegationPositionActionId.Withdraw) {
      let decoded = ethereum.decode('(address,address)', event.params.actionArgs);

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();

      let indexer = tuple[0].toAddress();
      let newIndexer = tuple[1].toAddress();

      let isRedelegating = newIndexer.notEqual(ZERO_ADDRESS);

      let delegationToIndexerId = getTheGraphDelegationToIndexerId(event.params.externalPosition, indexer);

      let beforeWithdrawTokensLocked = useTheGraphDelegationToIndexer(delegationToIndexerId).tokensLocked;

      let afterWithdrawGraphDelegationToIndexer = trackTheGraphDelegationToIndexer(
        event.params.externalPosition,
        indexer,
        event,
      );

      let afterWithdrawTokensLocked = BigDecimal.fromString('0');
      // if null then the graph delegation was deleted by remove indexer event
      if (afterWithdrawGraphDelegationToIndexer != null) {
        afterWithdrawTokensLocked = afterWithdrawGraphDelegationToIndexer.tokensLocked;
      }

      let tokensLockedDiffAmount = beforeWithdrawTokensLocked.minus(afterWithdrawTokensLocked);
      let grtAsset = ensureAsset(grtAddress);
      let feeAssetAmount: AssetAmount | null = null;
      let assetAmount: AssetAmount;

      if (isRedelegating) {
        let feeAmount = tokensLockedDiffAmount.times(getDelegationTaxPercentage());

        let grtAmountWithoutFee = tokensLockedDiffAmount.minus(feeAmount);
        assetAmount = createAssetAmount(grtAsset, grtAmountWithoutFee, denominationAsset, 'grt-asset-amount', event);

        feeAssetAmount = createAssetAmount(grtAsset, feeAmount, denominationAsset, 'grt-fee-asset-amount', event);
      } else {
        assetAmount = createAssetAmount(grtAsset, tokensLockedDiffAmount, denominationAsset, 'grt-asset-amount', event);
      }

      createTheGraphDelegationPositionChange(
        event.params.externalPosition,
        assetAmount,
        indexer,
        feeAssetAmount,
        isRedelegating ? newIndexer : null,
        null,
        'Withdraw',
        vault,
        event,
      );

      if (isRedelegating) {
        trackTheGraphDelegationToIndexer(event.params.externalPosition, newIndexer, event);
      }
    }

    return;
  }

  if (type.label == 'CONVEX_VOTING') {
    if (actionId == ConvexVotingPositionActionId.Lock) {
      let decoded = ethereum.decode('(uint256,uint256)', event.params.actionArgs);

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();

      let cvxAmount = tuple[0].toBigInt();

      let asset = ensureAsset(cvxAddress);
      let assetAmount = createAssetAmount(
        asset,
        toBigDecimal(cvxAmount, asset.decimals),
        denominationAsset,
        'cvx',
        event,
      );

      createConvexVotingPositionChange(
        event.params.externalPosition,
        [assetAmount],
        [asset],
        null,
        'Lock',
        vault,
        event,
      );

      updateConvexVotingPositionUserLocks(event.params.externalPosition);
    }

    if (actionId == ConvexVotingPositionActionId.Relock) {
      updateConvexVotingPositionWithdrawOrRelock(event.params.externalPosition, event);
      createConvexVotingPositionChange(event.params.externalPosition, null, null, null, 'Relock', vault, event);
    }

    if (actionId == ConvexVotingPositionActionId.Withdraw) {
      updateConvexVotingPositionWithdrawOrRelock(event.params.externalPosition, event);
      createConvexVotingPositionChange(event.params.externalPosition, null, null, null, 'Withdraw', vault, event);
    }

    if (actionId == ConvexVotingPositionActionId.Delegate) {
      let decoded = ethereum.decode('(address)', event.params.actionArgs);

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();

      let delegate = tuple[0].toAddress();

      let convexVotingPosition = useConvexVotingPosition(event.params.externalPosition.toHex());
      convexVotingPosition.delegate = delegate;
      convexVotingPosition.save();

      createConvexVotingPositionChange(event.params.externalPosition, null, null, delegate, 'Delegate', vault, event);
    }

    if (actionId == ConvexVotingPositionActionId.ClaimRewards) {
      let decoded = ethereum.decode(
        '(address[],bool,address[],tuple(address,uint256,uint256,bytes32[])[],bool)',
        tuplePrefixBytes(event.params.actionArgs),
      );

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();

      let votiumClaimsTuples = tuple[3].toTupleArray<ethereum.Tuple>();

      let merkleProofs: Bytes[][] = [];

      for (let i = 0; i < votiumClaimsTuples.length; i++) {
        let merkleProof = votiumClaimsTuples[i][3].toBytesArray();
        merkleProofs = arrayUnique<Bytes[]>(merkleProofs.concat([merkleProof]));
      }

      let convexVotingPosition = useConvexVotingPosition(event.params.externalPosition.toHex());

      let hashedMerkleProofs = merkleProofs.map<string>((merkleProof) => {
        let concatenatedProofHashes = merkleProof.reduce<Bytes>((proof, hash) => {
          return proof.concat(hash);
        }, new Bytes(0));

        return crypto.keccak256(concatenatedProofHashes).toHex();
      });

      convexVotingPosition.claimedVotiumMerkleProofsHashes = arrayUnique<string>(
        convexVotingPosition.claimedVotiumMerkleProofsHashes.concat(hashedMerkleProofs),
      );
      convexVotingPosition.save();

      let allTokensToTransfer = tuple[0].toAddressArray();
      let assets: Asset[] = new Array<Asset>();

      for (let i = 0; i < allTokensToTransfer.length; i++) {
        let asset = ensureAsset(allTokensToTransfer[i]);

        assets = assets.concat([asset]);
      }
      createConvexVotingPositionChange(event.params.externalPosition, null, assets, null, 'ClaimRewards', vault, event);
    }

    return;
  }

  if (type.label == 'ARBITRARY_LOAN') {
    if (actionId == ArbitraryLoanPositionActionId.ConfigureLoan) {
      let decoded = ethereum.decode(
        '(address,address,uint256,address,bytes,bytes32)',
        tuplePrefixBytes(event.params.actionArgs),
      );

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();

      let borrower = tuple[0].toAddress();
      let loanAssetAddress = tuple[1].toAddress();
      let loanAssetAmount = tuple[2].toBigInt();
      let accountingModuleAddress = tuple[3].toAddress();
      let accountingModuleConfigData = tuple[4].toBytes();
      let description = tuple[5].toBytes();

      let loanAsset = ensureAsset(loanAssetAddress);
      let assetAmount = createAssetAmount(
        loanAsset,
        toBigDecimal(loanAssetAmount, loanAsset.decimals),
        denominationAsset,
        'arb',
        event,
      );

      createArbitraryLoanPositionChange(
        event.params.externalPosition,
        [assetAmount],
        [loanAsset],
        borrower,
        accountingModuleAddress,
        accountingModuleConfigData,
        description.toString(),
        'ConfigureLoan',
        vault,
        event,
      );
    }

    if (actionId == ArbitraryLoanPositionActionId.Reconcile) {
      let decoded = ethereum.decode('(address[])', tuplePrefixBytes(event.params.actionArgs));

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();

      let extraAssetsToSweepAddresses = tuple[0].toAddressArray();

      let arbitraryLoanPosition = useArbitraryLoanPosition(event.params.externalPosition.toHex());

      if (arbitraryLoanPosition.loanAsset == null) {
        logCritical('Loan asset is null ArbitraryLoanPosition {}.', [event.params.externalPosition.toHex()]);

        return;
      }

      let loanAsset = ensureAsset(Address.fromString(arbitraryLoanPosition.loanAsset as string));

      let assets: Asset[] = new Array<Asset>();
      for (let i = 0; i < extraAssetsToSweepAddresses.length; i++) {
        let asset = ensureAsset(extraAssetsToSweepAddresses[i]);
        assets = arrayUnique<Asset>(assets.concat([asset]));
      }

      assets = arrayUnique<Asset>(assets.concat([loanAsset]));

      createArbitraryLoanPositionChange(
        event.params.externalPosition,
        null,
        assets,
        null,
        null,
        null,
        arbitraryLoanPosition.description,
        'Reconcile',
        vault,
        event,
      );
    }

    if (actionId == ArbitraryLoanPositionActionId.UpdateBorrowableAmount) {
      let arbitraryLoanPosition = useArbitraryLoanPosition(event.params.externalPosition.toHex());

      if (arbitraryLoanPosition.loanAsset == null) {
        logCritical('Loan asset is null ArbitraryLoanPosition {}.', [event.params.externalPosition.toHex()]);

        return;
      }

      let asset = ensureAsset(Address.fromString(arbitraryLoanPosition.loanAsset as string));

      let assetAmount = createAssetAmount(
        asset,
        arbitraryLoanPosition.borrowableAmount,
        denominationAsset,
        'arb',
        event,
      );

      createArbitraryLoanPositionChange(
        event.params.externalPosition,
        [assetAmount],
        [asset],
        null,
        null,
        null,
        arbitraryLoanPosition.description,
        'UpdateBorrowableAmount',
        vault,
        event,
      );
    }

    if (actionId == ArbitraryLoanPositionActionId.CallOnAccountingModule) {
      createArbitraryLoanPositionChange(
        event.params.externalPosition,
        null,
        null,
        null,
        null,
        null,
        null,
        'CallOnAccountingModule',
        vault,
        event,
      );
    }

    if (actionId == ArbitraryLoanPositionActionId.CloseLoan) {
      let decoded = ethereum.decode('(address[])', tuplePrefixBytes(event.params.actionArgs));

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();

      let extraAssetsToSweepAddresses = tuple[0].toAddressArray();

      let arbitraryLoanPosition = useArbitraryLoanPosition(event.params.externalPosition.toHex());

      if (arbitraryLoanPosition.loanAsset == null) {
        logCritical('Loan asset is null ArbitraryLoanPosition {}.', [event.params.externalPosition.toHex()]);

        return;
      }

      let loanAsset = ensureAsset(Address.fromString(arbitraryLoanPosition.loanAsset as string));

      let assets: Asset[] = new Array<Asset>();
      for (let i = 0; i < extraAssetsToSweepAddresses.length; i++) {
        let asset = ensureAsset(extraAssetsToSweepAddresses[i]);
        assets = arrayUnique<Asset>(assets.concat([asset]));
      }

      assets = arrayUnique<Asset>(assets.concat([loanAsset]));

      createArbitraryLoanPositionChange(
        event.params.externalPosition,
        null,
        assets,
        null,
        null,
        null,
        arbitraryLoanPosition.description,
        'CloseLoan',
        vault,
        event,
      );
    }

    return;
  }

  if (type.label == 'KILN_STAKING') {
    if (actionId == KilnStakingPositionActionId.Stake) {
      let decoded = ethereum.decode('(address,uint256)', event.params.actionArgs);

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();

      let stakingContractAddress = tuple[0].toAddress();
      let validatorAmount = tuple[1].toBigInt();

      ensureKilnStaking(stakingContractAddress);

      let wethAsset = ensureAsset(wethTokenAddress);

      let ethPerNode = BigDecimal.fromString('32');
      let amount = toBigDecimal(validatorAmount, 0).times(ethPerNode);
      let assetAmount = createAssetAmount(wethAsset, amount, denominationAsset, 'kiln-stake', event);

      createKilnStakingPositionChange(event.params.externalPosition, 'Stake', assetAmount, [], null, vault, event);

      let kilnStakingPosition = useKilnStakingPosition(event.params.externalPosition.toHex());
      kilnStakingPosition.stakedEthAmount = kilnStakingPosition.stakedEthAmount.plus(amount);
      kilnStakingPosition.save();
    }

    if (actionId == KilnStakingPositionActionId.ClaimFees) {
      let decoded = ethereum.decode('(address,bytes[],uint256)', tuplePrefixBytes(event.params.actionArgs));

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();

      let publicKeys = tuple[1].toBytesArray();
      let claimType = tuple[2].toI32();

      createKilnStakingPositionChange(
        event.params.externalPosition,
        'ClaimFees',
        null,
        publicKeys,
        kilnClaimFeeType(claimType),
        vault,
        event,
      );
    }

    if (actionId == KilnStakingPositionActionId.WithdrawEth) {
      createKilnStakingPositionChange(event.params.externalPosition, 'WithdrawEth', null, [], null, vault, event);
    }

    return;
  }

  createUnknownExternalPositionChange(event.params.externalPosition, vault, event);
}

export function handleExternalPositionTypeInfoUpdated(event: ExternalPositionTypeInfoUpdated): void {}
export function handleValidatedVaultProxySetForFund(event: ValidatedVaultProxySetForFund): void {}
