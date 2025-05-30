import {
  arrayDiff,
  arrayUnique,
  fromBigDecimal,
  logCritical,
  toBigDecimal,
  tuplePrefixBytes,
  ZERO_ADDRESS,
} from '@enzymefinance/subgraph-utils';
import {
  Address,
  Bytes,
  DataSourceContext,
  ethereum,
  crypto,
  BigDecimal,
  BigInt,
  ByteArray,
  log,
} from '@graphprotocol/graph-ts';
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
import { AliceOrder, Asset, AssetAmount, MysoV3Escrow } from '../../generated/schema';
import {
  AlicePositionLib4DataSource,
  ArbitraryLoanPositionLib4DataSource,
  GMXV2LeverageTradingPositionLib4DataSource,
  KilnStakingPositionLib4DataSource,
  LidoWithdrawalsPositionLib4DataSource,
  MapleLiquidityPositionLib4DataSource,
  MysoV3OptionWritingPositionLib4DataSource,
  // MorphoBluePositionLib4DataSource,
  StakeWiseV3StakingPositionLib4DataSource,
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
  LidoWithdrawalsActionId,
  StaderWithdrawalsActionId,
  AaveV3DebtPositionActionId,
  StakeWiseV3StakingPositionActionId,
  PendleV2ActionId,
  GMXV2LeverageTradingActionId,
  AliceActionId,
  // MorphoBlueActionId,
  MysoV3ActionId,
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
import {
  cvxAddress,
  lusdAddress,
  grtAddress,
  wethTokenAddress,
  mplAddress,
  aliceOrderManagerAddress,
  stethAddress,
  ethxAddress,
} from '../../generated/addresses';
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
  ethPerKilnNode,
} from '../../entities/KilnStakingPosition';
import { kilnClaimFeeType } from '../../utils/kilnClaimFeeType';
import {
  createLidoWithdrawalsPosition,
  createLidoWithdrawalsPositionChange,
} from '../../entities/LidoWithdrawalsPosition';
import {
  createStaderWithdrawalsPosition,
  createStaderWithdrawalsPositionChange,
} from '../../entities/StaderWithdrawalsPosition';
import {
  createAaveV3DebtPosition,
  createAaveV3DebtPositionChange,
  setEModeAaveV3DebtPosition,
} from '../../entities/AaveV3DebtPosition';
import {
  ensureStakeWiseVaultToken,
  createStakeWiseStakingPositionChange,
  useStakeWiseStakingPosition,
  stakeWiseStakingExitRequestId,
  useStakeWiseStakingExitRequest,
  createStakeWiseStakingPosition,
} from '../../entities/StakeWiseStakingPosition';
import {
  createPendleV2Position,
  createPendleV2PositionChange,
  usePendleV2AllowedMarket,
  usePendleV2Position,
} from '../../entities/PendleV2Position';
import { tokenBalance } from '../../utils/tokenCalls';
import { ZERO_BD } from '@enzymefinance/subgraph-utils';
import {
  createGMXV2LeverageTradingPosition,
  createGMXV2LeverageTradingPositionChange,
  gmxUsdDecimals,
} from '../../entities/GMXV2LeverageTradingPosition';
import { createAlicePosition, createAlicePositionChange, useAliceOrder } from '../../entities/AlicePosition';
import { aaveV3LikeDebtTypes } from '../../utils/aaveV3Like';
import {
  createMysoV3OptionWritingPosition,
  createMysoV3OptionWritingPositionChange,
  useMysoV3Escrow,
} from '../../entities/MysoV3OptionWritingPosition';
// import {
//   createMorphoBluePosition,
//   createMorphoBluePositionChange,
//   ensureMorphoBlueMarket,
// } from '../../entities/MorphoBluePosition';

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

  if (aaveV3LikeDebtTypes.includes(type.label)) {
    createAaveV3DebtPosition(event.params.externalPosition, event.params.vaultProxy, type);
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

    KilnStakingPositionLib4DataSource.create(event.params.externalPosition);

    return;
  }

  if (type.label == 'LIDO_WITHDRAWALS') {
    createLidoWithdrawalsPosition(event.params.externalPosition, event.params.vaultProxy, type);

    LidoWithdrawalsPositionLib4DataSource.create(event.params.externalPosition);

    return;
  }

  if (type.label == 'STADER_WITHDRAWALS') {
    createStaderWithdrawalsPosition(event.params.externalPosition, event.params.vaultProxy, type);

    return;
  }

  if (type.label == 'PENDLE_V2') {
    createPendleV2Position(event.params.externalPosition, event.params.vaultProxy, type);

    return;
  }

  if (type.label == 'GMX_V2_LEVERAGE_TRADING') {
    createGMXV2LeverageTradingPosition(event.params.externalPosition, event.params.vaultProxy, type);

    GMXV2LeverageTradingPositionLib4DataSource.create(event.params.externalPosition);
    return;
  }

  // if (type.label == 'MORPHO_BLUE') {
  //   createMorphoBluePosition(event.params.externalPosition, event.params.vaultProxy, type);

  //   MorphoBluePositionLib4DataSource.create(event.params.externalPosition);

  //   return;
  // }

  if (type.label == 'STAKEWISE_V3') {
    createStakeWiseStakingPosition(event.params.externalPosition, event.params.vaultProxy, type);

    StakeWiseV3StakingPositionLib4DataSource.create(event.params.externalPosition);

    return;
  }

  if (type.label == 'ALICE') {
    createAlicePosition(event.params.externalPosition, event.params.vaultProxy, type);

    AlicePositionLib4DataSource.create(event.params.externalPosition);

    return;
  }

  if (type.label == 'MYSO_V3_OPTION_WRITING') {
    createMysoV3OptionWritingPosition(event.params.externalPosition, event.params.vaultProxy, type);

    MysoV3OptionWritingPositionLib4DataSource.create(event.params.externalPosition);

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

  if (aaveV3LikeDebtTypes.includes(type.label)) {
    if (actionId == AaveV3DebtPositionActionId.AddCollateral) {
      let decoded = ethereum.decode('(address[],uint256[],bool)', tuplePrefixBytes(event.params.actionArgs));

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();

      let aTokens = tuple[0].toAddressArray();
      let amounts = tuple[1].toBigIntArray();
      let fromUnderlying = tuple[2].toBoolean();

      let assetAmounts: AssetAmount[] = new Array<AssetAmount>();
      let assets: Asset[] = new Array<Asset>();
      for (let i = 0; i < aTokens.length; i++) {
        let asset = fromUnderlying
          ? ensureAsset(ExternalSdk.bind(aTokens[i]).UNDERLYING_ASSET_ADDRESS())
          : ensureAsset(aTokens[i]);
        let amount = toBigDecimal(amounts[i], asset.decimals);
        let assetAmount = createAssetAmount(asset, amount, denominationAsset, 'av3dp', event);
        assetAmounts = assetAmounts.concat([assetAmount]);
        assets = assets.concat([asset]);
      }

      createAaveV3DebtPositionChange(
        event.params.externalPosition,
        assetAmounts,
        assets,
        null,
        'AddCollateral',
        vault,
        event,
      );
    }

    if (actionId == AaveV3DebtPositionActionId.RemoveCollateral) {
      let decoded = ethereum.decode('(address[],uint256[],bool)', tuplePrefixBytes(event.params.actionArgs));

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();

      let aTokens = tuple[0].toAddressArray();
      let amounts = tuple[1].toBigIntArray();
      let toUnderlying = tuple[2].toBoolean();

      let assetAmounts: AssetAmount[] = new Array<AssetAmount>();
      let assets: Asset[] = new Array<Asset>();
      for (let i = 0; i < aTokens.length; i++) {
        let asset = toUnderlying
          ? ensureAsset(ExternalSdk.bind(aTokens[i]).UNDERLYING_ASSET_ADDRESS())
          : ensureAsset(aTokens[i]);
        let amount = toBigDecimal(amounts[i], asset.decimals);
        let assetAmount = createAssetAmount(asset, amount, denominationAsset, 'av3dp', event);
        assetAmounts = assetAmounts.concat([assetAmount]);
        assets = assets.concat([asset]);
      }

      createAaveV3DebtPositionChange(
        event.params.externalPosition,
        assetAmounts,
        assets,
        null,
        'RemoveCollateral',
        vault,
        event,
      );
    }

    if (actionId == AaveV3DebtPositionActionId.Borrow) {
      let decoded = ethereum.decode('(address[],uint256[])', tuplePrefixBytes(event.params.actionArgs));

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();

      let underlyings = tuple[0].toAddressArray();
      let amounts = tuple[1].toBigIntArray();

      let assetAmounts: AssetAmount[] = new Array<AssetAmount>();
      let assets: Asset[] = new Array<Asset>();
      for (let i = 0; i < underlyings.length; i++) {
        let asset = ensureAsset(underlyings[i]);
        let amount = toBigDecimal(amounts[i], asset.decimals);
        let assetAmount = createAssetAmount(asset, amount, denominationAsset, 'av3dp', event);
        assetAmounts = assetAmounts.concat([assetAmount]);
        assets = assets.concat([asset]);
      }

      createAaveV3DebtPositionChange(event.params.externalPosition, assetAmounts, assets, null, 'Borrow', vault, event);
    }

    if (actionId == AaveV3DebtPositionActionId.RepayBorrow) {
      let decoded = ethereum.decode('(address[],uint256[])', tuplePrefixBytes(event.params.actionArgs));

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();

      let underlyings = tuple[0].toAddressArray();
      let amounts = tuple[1].toBigIntArray();

      let assetAmounts: AssetAmount[] = new Array<AssetAmount>();
      let assets: Asset[] = new Array<Asset>();
      for (let i = 0; i < underlyings.length; i++) {
        let asset = ensureAsset(underlyings[i]);
        let amount = toBigDecimal(amounts[i], asset.decimals);
        let assetAmount = createAssetAmount(asset, amount, denominationAsset, 'av3dp', event);
        assetAmounts = assetAmounts.concat([assetAmount]);
        assets = assets.concat([asset]);
      }

      createAaveV3DebtPositionChange(
        event.params.externalPosition,
        assetAmounts,
        assets,
        null,
        'RepayBorrow',
        vault,
        event,
      );
    }

    if (actionId == AaveV3DebtPositionActionId.SetEMode) {
      let decoded = ethereum.decode('(uint8)', event.params.actionArgs);

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();
      let categoryId = tuple[0].toBigInt();

      setEModeAaveV3DebtPosition(event.params.externalPosition, categoryId);

      createAaveV3DebtPositionChange(event.params.externalPosition, null, null, categoryId, 'SetEMode', vault, event);
    }

    if (actionId == AaveV3DebtPositionActionId.SetUseReserveAsCollateral) {
      // TODO: handle this event properly, when we will decide to implement it in the frontend
      createAaveV3DebtPositionChange(
        event.params.externalPosition,
        null,
        null,
        null,
        'SetUseReserveAsCollateral',
        vault,
        event,
      );
    }

    if (actionId == AaveV3DebtPositionActionId.ClaimRewards) {
      let decoded = ethereum.decode('(address[],uint256,address)', tuplePrefixBytes(event.params.actionArgs));

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();
      let rewardAmount = tuple[1].toBigInt();
      let rewardToken = tuple[2].toAddress();

      let rewardAsset = ensureAsset(rewardToken);
      let amount = toBigDecimal(rewardAmount, rewardAsset.decimals);
      let rewardAssetAmount = createAssetAmount(rewardAsset, amount, denominationAsset, 'av3dp', event);

      createAaveV3DebtPositionChange(
        event.params.externalPosition,
        [rewardAssetAmount],
        [rewardAsset],
        null,
        'ClaimRewards',
        vault,
        event,
      );
    }

    if (actionId == AaveV3DebtPositionActionId.Sweep) {
      let decoded = ethereum.decode('(address[])', tuplePrefixBytes(event.params.actionArgs));

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();
      let assetAddresses = tuple[0].toAddressArray();

      let assets: Asset[] = new Array<Asset>();
      for (let i = 0; i < assetAddresses.length; i++) {
        let asset = ensureAsset(assetAddresses[i]);
        assets = assets.concat([asset]);
      }

      createAaveV3DebtPositionChange(event.params.externalPosition, null, assets, null, 'Sweep', vault, event);
    }

    if (actionId == AaveV3DebtPositionActionId.ClaimMerklRewards) {
      let decoded = ethereum.decode('(address[],uint256[],bytes32[][])', tuplePrefixBytes(event.params.actionArgs));

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();
      let assetAddresses = tuple[0].toAddressArray();
      let amounts = tuple[1].toBigIntArray();

      let assetAmounts: AssetAmount[] = new Array<AssetAmount>();
      let assets: Asset[] = new Array<Asset>();
      for (let i = 0; i < assetAddresses.length; i++) {
        let asset = ensureAsset(assetAddresses[i]);
        let amount = toBigDecimal(amounts[i], asset.decimals);
        let assetAmount = createAssetAmount(asset, amount, denominationAsset, 'av3dp', event);
        assetAmounts = assetAmounts.concat([assetAmount]);
        assets = assets.concat([asset]);
      }

      createAaveV3DebtPositionChange(
        event.params.externalPosition,
        assetAmounts,
        assets,
        null,
        'ClaimMerklRewards',
        vault,
        event,
      );
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
      let incomingAssetAsset = createAssetAmount(lusdAsset, lusdAmount, denominationAsset, 'ldp-incoming', event);

      let lusdGasCompensationAssetAmount = createAssetAmount(
        lusdAsset,
        lusdGasCompensationAmountBD,
        denominationAsset,
        'ldp-lusd-gas-compensation',
        event,
      );

      createLiquityDebtPositionChange(
        event.params.externalPosition,
        'OpenTrove',
        [incomingAssetAsset],
        [lusdAsset],
        outgoingAsset,
        lusdGasCompensationAssetAmount,
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
        [],
        outgoingAsset,
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

      let incomingAssetAmount = createAssetAmount(wethAsset, wethAmount, denominationAsset, 'ldp-incoming', event);

      createLiquityDebtPositionChange(
        event.params.externalPosition,
        'RemoveCollateral',
        [incomingAssetAmount],
        [wethAsset],
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

      let incomingAssetAmount = createAssetAmount(lusdAsset, lusdAmount, denominationAsset, 'ldp-incoming', event);

      createLiquityDebtPositionChange(
        event.params.externalPosition,
        'Borrow',
        [incomingAssetAmount],
        [lusdAsset],
        null,
        null,
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
        [],
        outgoingAsset,
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
        [wethAsset, lusdAsset],
        borrowedAssetAmount,
        null,
        vault,
        event,
      );
    }

    if (actionId == LiquityDebtPositionActionId.ClaimCollateral) {
      let wethAsset = ensureAsset(wethTokenAddress);

      createLiquityDebtPositionChange(
        event.params.externalPosition,
        'ClaimCollateral',
        [],
        [wethAsset],
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

    if (actionId == MapleLiquidityPositionActionId.LendV2) {
      let decoded = ethereum.decode('(address,uint256)', event.params.actionArgs);

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();

      let poolContractAddress = tuple[0].toAddress();

      let liquidityAssetAmount = tuple[1].toBigInt();

      let pool = ensureMapleLiquidityPoolV2(poolContractAddress);
      let assetAmount = createMapleLiquidityAssetAmountV2(pool, liquidityAssetAmount, denominationAsset, event);

      let asset = ensureAsset(Address.fromString(assetAmount.asset));

      createMapleLiquidityPositionChange(
        event.params.externalPosition,
        null,
        pool,
        assetAmount,
        asset,
        'LendV2',
        vault,
        event,
      );
    }

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

      let amount = toBigDecimal(validatorAmount, 0).times(ethPerKilnNode);
      let assetAmount = createAssetAmount(wethAsset, amount, denominationAsset, 'kiln-stake', event);

      createKilnStakingPositionChange(event.params.externalPosition, 'Stake', assetAmount, [], null, vault, event);
    }

    if (actionId == KilnStakingPositionActionId.ClaimFees) {
      let decoded = ethereum.decode('(address,bytes[],uint256)', tuplePrefixBytes(event.params.actionArgs));

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();

      let validatorIds = tuple[1].toBytesArray();
      let claimType = tuple[2].toI32();

      createKilnStakingPositionChange(
        event.params.externalPosition,
        'ClaimFees',
        null,
        validatorIds,
        kilnClaimFeeType(claimType),
        vault,
        event,
      );
    }

    if (actionId == KilnStakingPositionActionId.SweepEth) {
      createKilnStakingPositionChange(event.params.externalPosition, 'SweepEth', null, [], null, vault, event);
    }

    if (actionId == KilnStakingPositionActionId.Unstake) {
      let decoded = ethereum.decode('(address,bytes)', tuplePrefixBytes(event.params.actionArgs));

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();

      let stakingContractAddress = tuple[0].toAddress();
      let packedPublicKeys = tuple[1].toBytes();

      ensureKilnStaking(stakingContractAddress);

      let packedPublicKeysArray = new ByteArray(packedPublicKeys.length);
      packedPublicKeysArray.set(packedPublicKeys);

      let publicKeyLength = 48;
      let numberOfPublicKeys = packedPublicKeys.length / publicKeyLength;

      let wethAsset = ensureAsset(wethTokenAddress);

      let amount = toBigDecimal(BigInt.fromI32(numberOfPublicKeys), 0).times(ethPerKilnNode);
      let assetAmount = createAssetAmount(wethAsset, amount, denominationAsset, 'kiln-unstake', event);
      let validatorIds: Bytes[] = [];
      for (let i = 0; i < numberOfPublicKeys; i++) {
        validatorIds.push(
          Bytes.fromUint8Array(packedPublicKeysArray.subarray(i * publicKeyLength, (i + 1) * publicKeyLength - 1)),
        );
      }

      createKilnStakingPositionChange(
        event.params.externalPosition,
        'Unstake',
        assetAmount,
        validatorIds,
        null,
        vault,
        event,
      );
    }

    if (actionId == KilnStakingPositionActionId.PausePositionValue) {
      createKilnStakingPositionChange(
        event.params.externalPosition,
        'PausePositionValue',
        null,
        [],
        null,
        vault,
        event,
      );
    }

    if (actionId == KilnStakingPositionActionId.UnpausePositionValue) {
      createKilnStakingPositionChange(
        event.params.externalPosition,
        'UnpausePositionValue',
        null,
        [],
        null,
        vault,
        event,
      );
    }

    return;
  }

  if (type.label == 'LIDO_WITHDRAWALS') {
    if (actionId == LidoWithdrawalsActionId.RequestWithdrawals) {
      let decoded = ethereum.decode('(uint256[])', tuplePrefixBytes(event.params.actionArgs));

      if (decoded == null) {
        return;
      }

      let stethAsset = ensureAsset(stethAddress);

      let tuple = decoded.toTuple();

      let amountBI = tuple[0].toBigIntArray();

      let amounts: AssetAmount[] = [];
      for (let i: i32 = 0; i < amountBI.length; i++) {
        amounts.push(
          createAssetAmount(
            stethAsset,
            toBigDecimal(amountBI[i], 18),
            denominationAsset,
            'lido-request-' + i.toString(),
            event,
          ),
        );
      }

      createLidoWithdrawalsPositionChange(
        event.params.externalPosition,
        'RequestWithdrawals',
        amounts,
        null,
        vault,
        event,
      );
    }

    if (actionId == LidoWithdrawalsActionId.ClaimWithdrawals) {
      let decoded = ethereum.decode('(uint256[],uint256[])', tuplePrefixBytes(event.params.actionArgs));

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();

      let requestIds = tuple[0].toBigIntArray();
      // There is no value in tracking hints

      createLidoWithdrawalsPositionChange(
        event.params.externalPosition,
        'ClaimWithdrawals',
        null,
        requestIds,
        vault,
        event,
      );
    }

    return;
  }

  if (type.label == 'STADER_WITHDRAWALS') {
    if (actionId == StaderWithdrawalsActionId.RequestWithdrawals) {
      let decoded = ethereum.decode('(uint256)', event.params.actionArgs);

      if (decoded == null) {
        return;
      }

      let ethxAsset = ensureAsset(ethxAddress);

      let tuple = decoded.toTuple();

      let amount = createAssetAmount(
        ethxAsset,
        toBigDecimal(tuple[0].toBigInt(), 18),
        denominationAsset,
        'stader-request',
        event,
      );

      createStaderWithdrawalsPositionChange(
        event.params.externalPosition,
        'RequestWithdrawals',
        amount,
        null,
        vault,
        event,
      );
    }

    if (actionId == StaderWithdrawalsActionId.ClaimWithdrawals) {
      let decoded = ethereum.decode('(uint256)', event.params.actionArgs);

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();

      let requestId = tuple[0].toBigInt();

      createStaderWithdrawalsPositionChange(
        event.params.externalPosition,
        'ClaimWithdrawals',
        null,
        requestId,
        vault,
        event,
      );
    }

    return;
  }

  if (type.label == 'PENDLE_V2') {
    if (actionId == PendleV2ActionId.BuyPrincipalToken) {
      let decoded = ethereum.decode(
        '(address,address,uint256,tuple(uint256,uint256,uint256,uint256,uint256),uint256)',
        event.params.actionArgs,
      );

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();

      let market = tuple[0].toAddress();
      let depositToken = ensureAsset(tuple[1].toAddress());
      let depositAmount = toBigDecimal(tuple[2].toBigInt(), depositToken.decimals);

      let pendleMarket = usePendleV2AllowedMarket(Address.fromString(vault.id), market);

      let position = usePendleV2Position(event.params.externalPosition.toHex());
      position.principalTokenHoldings = arrayUnique(position.principalTokenHoldings.concat([pendleMarket.id]));
      position.save();

      let change = createPendleV2PositionChange(event.params.externalPosition, 'BuyPrincipalToken', vault, event);
      change.assets = [depositToken.id];
      change.assetAmounts = [
        createAssetAmount(depositToken, depositAmount, denominationAsset, 'pendle-buy-pt', event).id,
      ];
      change.markets = [pendleMarket.id];
      change.save();
    }

    if (actionId == PendleV2ActionId.SellPrincipalToken) {
      let decoded = ethereum.decode('(address,address,uint256,uint256)', event.params.actionArgs);

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();

      let market = tuple[0].toAddress();

      let pendleMarket = usePendleV2AllowedMarket(Address.fromString(vault.id), market);

      let principalTokenAddress = Address.fromString(pendleMarket.principalToken);

      let principalToken = ensureAsset(principalTokenAddress);
      let principalTokenAmount = toBigDecimal(tuple[2].toBigInt(), principalToken.decimals);

      let balance = tokenBalance(principalTokenAddress, event.params.externalPosition);
      if (balance && balance.isZero()) {
        let position = usePendleV2Position(event.params.externalPosition.toHex());
        //  TODO: check if this is correct. There could be several markets for a single principle token.
        position.principalTokenHoldings = arrayDiff(position.principalTokenHoldings, [pendleMarket.id]);
        position.save();
      }

      let change = createPendleV2PositionChange(event.params.externalPosition, 'SellPrincipalToken', vault, event);
      change.assets = [principalToken.id];
      change.assetAmounts = [
        createAssetAmount(principalToken, principalTokenAmount, denominationAsset, 'pendle-sell-pt', event).id,
      ];
      change.markets = [pendleMarket.id];
      change.save();
    }

    if (actionId == PendleV2ActionId.AddLiquidity) {
      let decoded = ethereum.decode(
        '(address,address,uint256,tuple(uint256,uint256,uint256,uint256,uint256),uint256)',
        event.params.actionArgs,
      );

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();

      let market = tuple[0].toAddress();
      let depositToken = ensureAsset(tuple[1].toAddress());
      let depositAmount = toBigDecimal(tuple[2].toBigInt(), depositToken.decimals);

      let pendleMarket = usePendleV2AllowedMarket(Address.fromString(vault.id), market);

      let position = usePendleV2Position(event.params.externalPosition.toHex());
      position.lpTokenHoldings = arrayUnique(position.lpTokenHoldings.concat([pendleMarket.id]));
      position.save();

      let change = createPendleV2PositionChange(event.params.externalPosition, 'AddLiquidity', vault, event);
      change.assets = [depositToken.id];
      change.assetAmounts = [
        createAssetAmount(depositToken, depositAmount, denominationAsset, 'pendle-add-liquidity', event).id,
      ];
      change.markets = [pendleMarket.id];
      change.save();
    }

    if (actionId == PendleV2ActionId.RemoveLiquidity) {
      let decoded = ethereum.decode('(address,address,uint256,uint256,uint256)', event.params.actionArgs);

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();

      let market = tuple[0].toAddress();
      let lpToken = ensureAsset(market);
      let lpTokenAmount = toBigDecimal(tuple[2].toBigInt(), lpToken.decimals);

      let pendleMarket = usePendleV2AllowedMarket(Address.fromString(vault.id), market);

      let balance = tokenBalance(market, event.params.externalPosition);
      if (balance && balance.isZero()) {
        let position = usePendleV2Position(event.params.externalPosition.toHex());
        position.lpTokenHoldings = arrayDiff(position.lpTokenHoldings, [pendleMarket.id]);
        position.save();
      }

      let change = createPendleV2PositionChange(event.params.externalPosition, 'RemoveLiquidity', vault, event);
      change.assets = [lpToken.id];
      change.assetAmounts = [
        createAssetAmount(lpToken, lpTokenAmount, denominationAsset, 'pendle-remove-liquidity', event).id,
      ];
      change.markets = [pendleMarket.id];
      change.save();
    }

    if (actionId == PendleV2ActionId.ClaimRewards) {
      let decoded = ethereum.decode('(address[])', tuplePrefixBytes(event.params.actionArgs));

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();

      let marketAddresses = tuple[0].toAddressArray();

      let markets = new Array<string>(marketAddresses.length);
      let assets = new Array<string>(0);
      for (let i: i32 = 0; i < marketAddresses.length; i++) {
        let marketAddress = marketAddresses[i];
        markets[i] = usePendleV2AllowedMarket(Address.fromString(vault.id), marketAddress).id;

        let marketContract = ExternalSdk.bind(marketAddress);
        let rewardTokensCall = marketContract.try_getRewardTokens();

        if (rewardTokensCall.reverted == false) {
          let rewardTokens = rewardTokensCall.value;

          let rewardAssetIds = rewardTokens.map<string>((rewardToken) => ensureAsset(rewardToken).id);
          assets = arrayUnique(assets.concat(rewardAssetIds));
        }
      }

      let change = createPendleV2PositionChange(event.params.externalPosition, 'ClaimRewards', vault, event);
      change.assets = assets;
      change.markets = markets;
      change.save();
    }

    return;
  }

  if (type.label == 'STAKEWISE_V3') {
    if (actionId == StakeWiseV3StakingPositionActionId.Stake) {
      let decoded = ethereum.decode('(address,uint256)', event.params.actionArgs);

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();

      let stakeWiseVault = tuple[0].toAddress();
      let amount = toBigDecimal(tuple[1].toBigInt(), 18);

      let stakeWiseV3EthVault = ExternalSdk.bind(stakeWiseVault);
      let shares = toBigDecimal(stakeWiseV3EthVault.convertToShares(tuple[1].toBigInt()), 18);

      let stakeWiseVaultToken = ensureStakeWiseVaultToken(stakeWiseVault, event);

      let wethAsset = ensureAsset(wethTokenAddress);

      let assetAmount = createAssetAmount(wethAsset, amount, denominationAsset, 'stakewise-stake', event);

      createStakeWiseStakingPositionChange(
        event.params.externalPosition,
        'Stake',
        stakeWiseVaultToken,
        assetAmount,
        shares,
        vault,
        event,
      );

      let stakingPosition = useStakeWiseStakingPosition(event.params.externalPosition.toHex());
      stakingPosition.stakedEthAmount = stakingPosition.stakedEthAmount.plus(amount);
      stakingPosition.save();
    }

    if (actionId == StakeWiseV3StakingPositionActionId.Redeem) {
      let decoded = ethereum.decode('(address,uint256)', event.params.actionArgs);

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();

      let stakeWiseVault = tuple[0].toAddress();
      let shares = toBigDecimal(tuple[1].toBigInt(), 18);

      let stakeWiseV3EthVault = ExternalSdk.bind(stakeWiseVault);
      let amount = toBigDecimal(stakeWiseV3EthVault.convertToAssets(tuple[1].toBigInt()), 18);

      let stakeWiseVaultToken = ensureStakeWiseVaultToken(stakeWiseVault, event);

      let wethAsset = ensureAsset(wethTokenAddress);

      let assetAmount = createAssetAmount(wethAsset, amount, denominationAsset, 'stakewise-redeem', event);

      createStakeWiseStakingPositionChange(
        event.params.externalPosition,
        'Redeem',
        stakeWiseVaultToken,
        assetAmount,
        shares,
        vault,
        event,
      );

      let stakingPosition = useStakeWiseStakingPosition(event.params.externalPosition.toHex());
      stakingPosition.stakedEthAmount = stakingPosition.stakedEthAmount.minus(amount);
      stakingPosition.save();
    }

    if (actionId == StakeWiseV3StakingPositionActionId.EnterExitQueue) {
      let decoded = ethereum.decode('(address,uint256)', event.params.actionArgs);

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();

      let stakeWiseVault = tuple[0].toAddress();
      let shares = toBigDecimal(tuple[1].toBigInt(), 18);

      let stakeWiseV3EthVault = ExternalSdk.bind(stakeWiseVault);
      let amount = toBigDecimal(stakeWiseV3EthVault.convertToAssets(tuple[1].toBigInt()), 18);

      let stakeWiseVaultToken = ensureStakeWiseVaultToken(stakeWiseVault, event);

      let wethAsset = ensureAsset(wethTokenAddress);

      let assetAmount = createAssetAmount(wethAsset, amount, denominationAsset, 'stakewise-enter-exit-queue', event);

      createStakeWiseStakingPositionChange(
        event.params.externalPosition,
        'EnterExitQueue',
        stakeWiseVaultToken,
        assetAmount,
        shares,
        vault,
        event,
      );

      let stakingPosition = useStakeWiseStakingPosition(event.params.externalPosition.toHex());
      stakingPosition.stakedEthAmount = stakingPosition.stakedEthAmount.minus(amount);
      stakingPosition.save();
    }

    if (actionId == StakeWiseV3StakingPositionActionId.ClaimExitedAssets) {
      let decoded = ethereum.decode('(address,uint256)', event.params.actionArgs);

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();

      let stakeWiseVault = tuple[0].toAddress();
      let positionTicket = tuple[1].toBigInt();

      let stakingPosition = useStakeWiseStakingPosition(event.params.externalPosition.toHex());
      let stakeWiseVaultToken = ensureStakeWiseVaultToken(stakeWiseVault, event);

      let wethAsset = ensureAsset(wethTokenAddress);

      let exitRequestId = stakeWiseStakingExitRequestId(stakingPosition, stakeWiseVaultToken, positionTicket);
      let exitRequest = useStakeWiseStakingExitRequest(exitRequestId);

      let sharesBI = fromBigDecimal(exitRequest.shares);

      let stakeWiseV3EthVault = ExternalSdk.bind(stakeWiseVault);
      let amount = toBigDecimal(stakeWiseV3EthVault.convertToAssets(sharesBI), 18);

      let assetAmount = createAssetAmount(wethAsset, amount, denominationAsset, 'stakewise-claim-exited-assets', event);

      createStakeWiseStakingPositionChange(
        event.params.externalPosition,
        'ClaimExitedAssets',
        stakeWiseVaultToken,
        assetAmount,
        exitRequest.shares,
        vault,
        event,
      );
    }

    return;
  }

  if (type.label == 'GMX_V2_LEVERAGE_TRADING') {
    if (actionId == GMXV2LeverageTradingActionId.CreateOrder) {
      // The shape of the tuple is different after the lib contracts were updated
      // We first try to decode the tuple with the old shape, if that fails we try the new shape
      let firstDecodeSuccessful = true;

      let decoded = ethereum.decode(
        '(tuple(address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint8,uint8,bool,address,bool))',
        event.params.actionArgs,
      );

      if (decoded == null) {
        firstDecodeSuccessful = false;

        decoded = ethereum.decode(
          '(tuple(address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint8,uint8,bool,address,bool))',
          event.params.actionArgs,
        );

        if (decoded == null) {
          return;
        }
      }

      let tuple = decoded.toTuple();
      let innerTuple = tuple[0].toTuple();

      let orderType: BigInt;
      let isLong: boolean;
      let exchangeRouter: Address;
      if (firstDecodeSuccessful) {
        orderType = innerTuple[8].toBigInt();
        isLong = innerTuple[10].toBoolean();
        exchangeRouter = innerTuple[11].toAddress();
      } else {
        orderType = innerTuple[9].toBigInt();
        isLong = innerTuple[11].toBoolean();
        exchangeRouter = innerTuple[12].toAddress();
      }

      let wethAsset = ensureAsset(wethTokenAddress);

      let market = innerTuple[0].toAddress();
      let initialCollateralToken = ensureAsset(innerTuple[1].toAddress());

      let sizeDeltaUsd = toBigDecimal(innerTuple[2].toBigInt(), gmxUsdDecimals);
      let initialCollateralDeltaAmount = toBigDecimal(innerTuple[3].toBigInt(), initialCollateralToken.decimals);
      let triggerPrice = innerTuple[4].toBigInt();
      let acceptablePrice = innerTuple[5].toBigInt();
      let executionFee = toBigDecimal(innerTuple[6].toBigInt(), wethAsset.decimals);

      let isCollateralTokenWeth = Address.fromString(initialCollateralToken.id) == wethTokenAddress;

      let assetAmount = createAssetAmount(
        initialCollateralToken,
        isCollateralTokenWeth ? initialCollateralDeltaAmount.minus(executionFee) : initialCollateralDeltaAmount,
        denominationAsset,
        'initial-collateral-token',
        event,
      );

      let executionFeeAssetAmount = createAssetAmount(
        wethAsset,
        executionFee,
        denominationAsset,
        'execution-fee',
        event,
      );

      createGMXV2LeverageTradingPositionChange(
        event.params.externalPosition,
        'CreateOrder',
        vault,
        isCollateralTokenWeth ? [wethAsset] : [initialCollateralToken, wethAsset],
        assetAmount,
        executionFeeAssetAmount,
        orderType,
        sizeDeltaUsd,
        triggerPrice,
        acceptablePrice,
        isLong ? BigInt.fromI32(1) : BigInt.fromI32(0),
        exchangeRouter,
        [market],
        null,
        event,
      );
    }

    if (actionId == GMXV2LeverageTradingActionId.UpdateOrder) {
      // The shape of the tuple is different after the lib contracts were updated
      // We first try to decode the tuple with the old shape, if that fails we try the new shape
      let firstDecodeSuccessful = true;

      let decoded = ethereum.decode(
        '(tuple(bytes32,uint256,uint256,uint256,uint256,bool,uint256,address))',
        event.params.actionArgs,
      );

      if (decoded == null) {
        firstDecodeSuccessful = false;

        decoded = ethereum.decode(
          '(tuple(bytes32,uint256,uint256,uint256,uint256,uint256,bool,uint256,address))',
          event.params.actionArgs,
        );

        if (decoded == null) {
          return;
        }
      }

      let tuple = decoded.toTuple();
      let innerTuple = tuple[0].toTuple();

      let wethAsset = ensureAsset(wethTokenAddress);

      let executionFeeIncrease: BigDecimal;
      let exchangeRouter: Address;
      if (firstDecodeSuccessful) {
        executionFeeIncrease = toBigDecimal(innerTuple[6].toBigInt(), wethAsset.decimals);
        exchangeRouter = innerTuple[7].toAddress();
      } else {
        executionFeeIncrease = toBigDecimal(innerTuple[7].toBigInt(), wethAsset.decimals);
        exchangeRouter = innerTuple[8].toAddress();
      }

      let orderKey = innerTuple[0].toBytes();
      let sizeDeltaUsd = toBigDecimal(innerTuple[1].toBigInt(), gmxUsdDecimals);
      let acceptablePrice = innerTuple[2].toBigInt();
      let triggerPrice = innerTuple[3].toBigInt();

      let executionFeeAssetAmount = createAssetAmount(
        wethAsset,
        executionFeeIncrease,
        denominationAsset,
        'execution-fee',
        event,
      );

      let isExecutionFeeZero = executionFeeIncrease.equals(ZERO_BD);

      createGMXV2LeverageTradingPositionChange(
        event.params.externalPosition,
        'UpdateOrder',
        vault,
        isExecutionFeeZero ? null : [wethAsset],
        null,
        isExecutionFeeZero ? null : executionFeeAssetAmount,
        null,
        sizeDeltaUsd,
        triggerPrice,
        acceptablePrice,
        null,
        exchangeRouter,
        null,
        orderKey,
        event,
      );
    }

    if (actionId == GMXV2LeverageTradingActionId.CancelOrder) {
      let decoded = ethereum.decode('(tuple(bytes32,address))', event.params.actionArgs);

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();
      let innerTuple = tuple[0].toTuple();

      let orderKey = innerTuple[0].toBytes();
      let exchangeRouter = innerTuple[1].toAddress();

      createGMXV2LeverageTradingPositionChange(
        event.params.externalPosition,
        'CancelOrder',
        vault,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        exchangeRouter,
        null,
        orderKey,
        event,
      );
    }

    if (actionId == GMXV2LeverageTradingActionId.ClaimFundingFees) {
      let decoded = ethereum.decode('(tuple(address[],address[],address))', tuplePrefixBytes(event.params.actionArgs));

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();
      let innerTuple = tuple[0].toTuple();

      let markets = innerTuple[0].toAddressArray();
      let assets = innerTuple[1].toAddressArray();
      let exchangeRouter = innerTuple[2].toAddress();

      createGMXV2LeverageTradingPositionChange(
        event.params.externalPosition,
        'ClaimFundingFees',
        vault,
        assets.map<Asset>((asset) => ensureAsset(asset)),
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        exchangeRouter,
        markets,
        null,
        event,
      );
    }

    // if (actionId == GMXV2LeverageTradingActionId.ClaimCollateral) {
    //   let decoded = ethereum.decode(
    //     '(tuple(address[],address[],uint256[],address))',
    //     tuplePrefixBytes(event.params.actionArgs),
    //   );

    //   if (decoded == null) {
    //     return;
    //   }

    //   let tuple = decoded.toTuple();
    //   let innerTuple = tuple[0].toTuple();

    //   let markets = innerTuple[0].toAddressArray();
    //   let assets = innerTuple[1].toAddressArray();
    //   let exchangeRouter = innerTuple[3].toAddress();

    //   createGMXV2LeverageTradingPositionChange(
    //     event.params.externalPosition,
    //     'ClaimCollateral',
    //     vault,
    //     assets.map<Asset>((asset) => ensureAsset(asset)),
    //     null,
    //     null,
    //     null,
    //     null,
    //     null,
    //     null,
    //     null,
    //     exchangeRouter,
    //     markets,
    //     null,
    //     event,
    //   );
    // }

    if (actionId == GMXV2LeverageTradingActionId.Sweep) {
      createGMXV2LeverageTradingPositionChange(
        event.params.externalPosition,
        'Sweep',
        vault,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        event,
      );
    }

    return;
  }

  // if (type.label == 'MORPHO_BLUE') {
  //   if (actionId == MorphoBlueActionId.Lend) {
  //     let decoded = ethereum.decode('(bytes32,uint256)', event.params.actionArgs);

  //     if (decoded == null) {
  //       return;
  //     }

  //     let tuple = decoded.toTuple();

  //     let marketId = tuple[0].toBytes();

  //     let morphoBlueMarket = ensureMorphoBlueMarket(event.address, marketId);
  //     let loanToken = ensureAsset(Address.fromString(morphoBlueMarket.loanToken));

  //     let amount = toBigDecimal(tuple[1].toBigInt(), loanToken.decimals);

  //     let assetAmount = createAssetAmount(loanToken, amount, denominationAsset, 'morpho-blue-lend', event);

  //     createMorphoBluePositionChange(
  //       event.params.externalPosition,
  //       'Lend',
  //       vault,
  //       morphoBlueMarket,
  //       assetAmount,
  //       event,
  //     );
  //   }

  //   if (actionId == MorphoBlueActionId.Redeem) {
  //       let decoded = ethereum.decode('(bytes32,uint256)', event.params.actionArgs);

  //       if (decoded == null) {
  //         return;
  //       }

  //       let tuple = decoded.toTuple();

  //       let marketId = tuple[0].toBytes();

  //       let morphoBlueMarket = ensureMorphoBlueMarket(event.address, marketId);
  //       let loanToken = ensureAsset(Address.fromString(morphoBlueMarket.loanToken));

  //       let amount = toBigDecimal(tuple[1].toBigInt(), loanToken.decimals);

  //       let assetAmount = createAssetAmount(loanToken, amount, denominationAsset, 'morpho-blue-redeem', event);

  //       createMorphoBluePositionChange(
  //         event.params.externalPosition,
  //         'Redeem',
  //         vault,
  //         morphoBlueMarket,
  //         assetAmount,
  //         event,
  //       );
  //   }

  //   if (actionId == MorphoBlueActionId.AddCollateral) {
  //     let decoded = ethereum.decode('(bytes32,uint256)', event.params.actionArgs);

  //     if (decoded == null) {
  //       return;
  //     }

  //     let tuple = decoded.toTuple();

  //     let marketId = tuple[0].toBytes();

  //     let morphoBlueMarket = ensureMorphoBlueMarket(event.address, marketId);
  //     let collateralToken = ensureAsset(Address.fromString(morphoBlueMarket.collateralToken));

  //     let amount = toBigDecimal(tuple[1].toBigInt(), collateralToken.decimals);

  //     let assetAmount = createAssetAmount(collateralToken, amount, denominationAsset, 'morpho-blue-add-collateral', event);

  //     createMorphoBluePositionChange(
  //       event.params.externalPosition,
  //       'AddCollateral',
  //       vault,
  //       morphoBlueMarket,
  //       assetAmount,
  //       event,
  //     );
  //   }

  //   if (actionId == MorphoBlueActionId.RemoveCollateral) {
  //     let decoded = ethereum.decode('(bytes32,uint256)', event.params.actionArgs);

  //     if (decoded == null) {
  //       return;
  //     }

  //     let tuple = decoded.toTuple();

  //     let marketId = tuple[0].toBytes();

  //     let morphoBlueMarket = ensureMorphoBlueMarket(event.address, marketId);
  //     let collateralToken = ensureAsset(Address.fromString(morphoBlueMarket.collateralToken));

  //     let amount = toBigDecimal(tuple[1].toBigInt(), collateralToken.decimals);

  //     let assetAmount = createAssetAmount(collateralToken, amount, denominationAsset, 'morpho-blue-remove-collateral', event);

  //     createMorphoBluePositionChange(
  //       event.params.externalPosition,
  //       'RemoveCollateral',
  //       vault,
  //       morphoBlueMarket,
  //       assetAmount,
  //       event,
  //     );
  //   }

  //   if (actionId == MorphoBlueActionId.Borrow) {
  //     let decoded = ethereum.decode('(bytes32,uint256)', event.params.actionArgs);

  //     if (decoded == null) {
  //       return;
  //     }

  //     let tuple = decoded.toTuple();

  //     let marketId = tuple[0].toBytes();

  //     let morphoBlueMarket = ensureMorphoBlueMarket(event.address, marketId);
  //     let borrowToken = ensureAsset(Address.fromString(morphoBlueMarket.loanToken));

  //     let amount = toBigDecimal(tuple[1].toBigInt(), borrowToken.decimals);

  //     let assetAmount = createAssetAmount(borrowToken, amount, denominationAsset, 'morpho-blue-borrow', event);

  //     createMorphoBluePositionChange(
  //       event.params.externalPosition,
  //       'Borrow',
  //       vault,
  //       morphoBlueMarket,
  //       assetAmount,
  //       event,
  //     );
  //   }

  //   if (actionId == MorphoBlueActionId.Repay) {
  //     let decoded = ethereum.decode('(bytes32,uint256)', event.params.actionArgs);

  //     if (decoded == null) {
  //       return;
  //     }

  //     let tuple = decoded.toTuple();

  //     let marketId = tuple[0].toBytes();

  //     let morphoBlueMarket = ensureMorphoBlueMarket(event.address, marketId);
  //     let borrowToken = ensureAsset(Address.fromString(morphoBlueMarket.loanToken));

  //     let amount = toBigDecimal(tuple[1].toBigInt(), borrowToken.decimals);

  //     let assetAmount = createAssetAmount(borrowToken, amount, denominationAsset, 'morpho-blue-repay', event);

  //     createMorphoBluePositionChange(
  //       event.params.externalPosition,
  //       'Repay',
  //       vault,
  //       morphoBlueMarket,
  //       assetAmount,
  //       event,
  //     );
  //   }
  //   return;
  // }

  if (type.label == 'ALICE') {
    if (actionId == AliceActionId.PlaceOrder) {
      let decoded = ethereum.decode('(tuple(uint16,bool,uint256,uint256))', event.params.actionArgs);

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();
      let innerTuple = tuple[0].toTuple();
      let instrumentId = innerTuple[0].toI32();
      let isBuyOrder = innerTuple[1].toBoolean();
      let quantityToSell = innerTuple[2].toBigInt();
      let limitAmountToGet = innerTuple[3].toBigInt();

      let orderManagerContract = ExternalSdk.bind(aliceOrderManagerAddress);
      let instrumentCall = orderManagerContract.try_getInstrument(instrumentId, true);

      if (instrumentCall.reverted == true) {
        return;
      }

      let baseAsset = instrumentCall.value.base.equals(ZERO_ADDRESS)
        ? ensureAsset(wethTokenAddress)
        : ensureAsset(instrumentCall.value.base);
      let quoteAsset = instrumentCall.value.quote.equals(ZERO_ADDRESS)
        ? ensureAsset(wethTokenAddress)
        : ensureAsset(instrumentCall.value.quote);

      let outgoingAsset = isBuyOrder == true ? quoteAsset : baseAsset;
      let incomingAsset = isBuyOrder == true ? baseAsset : quoteAsset;

      let outgoingAssetAmount = createAssetAmount(
        outgoingAsset,
        toBigDecimal(quantityToSell, outgoingAsset.decimals),
        denominationAsset,
        'alice-sell',
        event,
      );

      let minIncomingAssetAmount = createAssetAmount(
        incomingAsset,
        toBigDecimal(limitAmountToGet, incomingAsset.decimals),
        denominationAsset,
        'alice-buy',
        event,
      );

      createAlicePositionChange(
        event.params.externalPosition,
        new Array<AliceOrder>(0),
        outgoingAssetAmount,
        minIncomingAssetAmount,
        'PlaceOrder',
        vault,
        event,
      );
    }

    if (actionId == AliceActionId.RefundOrder) {
      let decoded = ethereum.decode('(tuple(uint256,uint16,bool,uint256,uint256,uint256))', event.params.actionArgs);

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();
      let innerTuple = tuple[0].toTuple();
      let orderId = innerTuple[0].toBigInt();
      let instrumentId = innerTuple[1].toI32();
      let isBuyOrder = innerTuple[2].toBoolean();
      let quantityToSell = innerTuple[3].toBigInt();
      let limitAmountToGet = innerTuple[4].toBigInt();

      let orderManagerContract = ExternalSdk.bind(aliceOrderManagerAddress);
      let instrumentCall = orderManagerContract.try_getInstrument(instrumentId, true);

      if (instrumentCall.reverted == true) {
        return;
      }

      let aliceOrder = useAliceOrder(orderId.toString());

      let baseAsset = instrumentCall.value.base.equals(ZERO_ADDRESS)
        ? ensureAsset(wethTokenAddress)
        : ensureAsset(instrumentCall.value.base);
      let quoteAsset = instrumentCall.value.quote.equals(ZERO_ADDRESS)
        ? ensureAsset(wethTokenAddress)
        : ensureAsset(instrumentCall.value.quote);

      let outgoingAsset = isBuyOrder == true ? quoteAsset : baseAsset;
      let incomingAsset = isBuyOrder == true ? baseAsset : quoteAsset;

      let outgoingAssetAmount = createAssetAmount(
        outgoingAsset,
        toBigDecimal(quantityToSell, outgoingAsset.decimals),
        denominationAsset,
        'alice-sell',
        event,
      );

      let minIncomingAssetAmount = createAssetAmount(
        incomingAsset,
        toBigDecimal(limitAmountToGet, incomingAsset.decimals),
        denominationAsset,
        'alice-buy',
        event,
      );

      createAlicePositionChange(
        event.params.externalPosition,
        [aliceOrder],
        outgoingAssetAmount,
        minIncomingAssetAmount,
        'RefundOrder',
        vault,
        event,
      );
    }

    if (actionId == AliceActionId.Sweep) {
      let decoded = ethereum.decode('(tuple(uint256[]))', tuplePrefixBytes(event.params.actionArgs));

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();
      let innerTuple = tuple[0].toTuple();
      let orderIds = innerTuple[0].toBigIntArray();

      let orders = orderIds.map<AliceOrder>((orderId) => useAliceOrder(orderId.toString()));

      createAlicePositionChange(event.params.externalPosition, orders, null, null, 'Sweep', vault, event);
    }

    return;
  }

  if (type.label == 'MYSO_V3_OPTION_WRITING') {
    if (actionId == MysoV3ActionId.CreateEscrowByTakingQuote) {
      // We are decoding only the relevant part of the actionArgs
      // The rest of the tuple involves complex dynamic-size nested tuples that TheGraph utils can't seem to decode, even with tuplePrefixBytes handling
      // The full tuple signature is: '(tuple(tuple(tuple(address,uint48,address,uint48,uint128,uint128,tuple(uint64,address,bool,bool,address)),tuple(uint128,uint256,bytes,address)),address))'
      const truncatedActionArgs = Bytes.fromUint8Array(event.params.actionArgs.slice(96, 96 + 32 * 6));

      const decoded = ethereum.decode('(address,uint48,address,uint48,uint128,uint128)', truncatedActionArgs);

      if (decoded == null) {
        return;
      }

      const optionInfo = decoded.toTuple();
      const underlying = optionInfo[0].toAddress();
      const settlement = optionInfo[2].toAddress();
      const notional = optionInfo[4].toBigInt();

      let underlyingAsset = ensureAsset(underlying);
      let outgoingAssetAmount = createAssetAmount(
        underlyingAsset,
        toBigDecimal(notional, underlyingAsset.decimals),
        denominationAsset,
        'myso-v3-underlying',
        event,
      );

      let incomingAssets: Asset[] = [ensureAsset(settlement)];

      let change = createMysoV3OptionWritingPositionChange(
        event.params.externalPosition,
        null,
        incomingAssets,
        outgoingAssetAmount,
        'CreateEscrowByTakingQuote',
        vault,
        event,
      );
      change.save();
    }

    if (actionId == MysoV3ActionId.CreateEscrowByStartingAuction) {
      let decoded = ethereum.decode(
        '(tuple(tuple(address,address,uint128,tuple(uint128,uint48,uint48,uint32,uint32,uint64,uint64,uint128,uint128),tuple(uint64,address,bool,bool,address)),address))',
        event.params.actionArgs,
      );
      if (decoded == null) {
        return;
      }
      let tuple = decoded.toTuple();
      let argsTuple = tuple[0].toTuple();
      let auctionInitTuple = argsTuple[0].toTuple();

      let underlyingToken = auctionInitTuple[0].toAddress();
      let notional = auctionInitTuple[2].toBigInt();

      let underlyingAsset = ensureAsset(underlyingToken);
      let outgoingAssetAmount = createAssetAmount(
        underlyingAsset,
        toBigDecimal(notional, underlyingAsset.decimals),
        denominationAsset,
        'myso-v3-underlying',
        event,
      );

      let change = createMysoV3OptionWritingPositionChange(
        event.params.externalPosition,
        null,
        null,
        outgoingAssetAmount,
        'CreateEscrowByStartingAuction',
        vault,
        event,
      );
      change.save();
    }

    if (actionId == MysoV3ActionId.CloseAndSweepEscrows) {
      let decoded = ethereum.decode('(tuple(uint32[],bool))', tuplePrefixBytes(event.params.actionArgs));
      if (decoded == null) {
        return;
      }
      let tuple = decoded.toTuple();
      let argsTuple = tuple[0].toTuple();
      let escrowIdxs = argsTuple[0].toBigIntArray();

      let escrows = escrowIdxs.map<MysoV3Escrow>((escrowId) => useMysoV3Escrow(escrowId));
      let incomingAssets: Asset[] = new Array<Asset>();
      for (let i = 0; i < event.params.assetsToReceive.length; i++) {
        let asset = ensureAsset(event.params.assetsToReceive[i]);
        incomingAssets = incomingAssets.concat([asset]);
      }

      let change = createMysoV3OptionWritingPositionChange(
        event.params.externalPosition,
        escrows,
        incomingAssets,
        null,
        'CloseAndSweepEscrows',
        vault,
        event,
      );
      change.save();
    }

    if (actionId == MysoV3ActionId.WithdrawTokensFromEscrows) {
      let decoded = ethereum.decode('(tuple(address[],address[]))', tuplePrefixBytes(event.params.actionArgs));
      if (decoded == null) {
        return;
      }
      let tuple = decoded.toTuple();
      let argsTuple = tuple[0].toTuple();
      let tokens = argsTuple[1].toAddressArray();

      let incomingAssets: Asset[] = new Array<Asset>();
      for (let i = 0; i < tokens.length; i++) {
        let asset = ensureAsset(tokens[i]);
        incomingAssets = incomingAssets.concat([asset]);
      }

      let change = createMysoV3OptionWritingPositionChange(
        event.params.externalPosition,
        null,
        incomingAssets,
        null,
        'WithdrawTokensFromEscrows',
        vault,
        event,
      );
      change.save();
    }

    if (actionId == MysoV3ActionId.Sweep) {
      let decoded = ethereum.decode('(tuple(address[]))', tuplePrefixBytes(event.params.actionArgs));
      if (decoded == null) {
        return;
      }
      let tuple = decoded.toTuple();
      let argsTuple = tuple[0].toTuple();
      let tokens = argsTuple[0].toAddressArray();

      let incomingAssets: Asset[] = new Array<Asset>();
      for (let i = 0; i < tokens.length; i++) {
        let asset = ensureAsset(tokens[i]);
        incomingAssets = incomingAssets.concat([asset]);
      }

      let change = createMysoV3OptionWritingPositionChange(
        event.params.externalPosition,
        null,
        incomingAssets,
        null,
        'Sweep',
        vault,
        event,
      );
      change.save();
    }

    return;
  }

  createUnknownExternalPositionChange(event.params.externalPosition, vault, event);
}

export function handleExternalPositionTypeInfoUpdated(event: ExternalPositionTypeInfoUpdated): void {}
export function handleValidatedVaultProxySetForFund(event: ValidatedVaultProxySetForFund): void {}
