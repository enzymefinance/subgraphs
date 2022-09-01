import { arrayUnique, logCritical, toBigDecimal, tuplePrefixBytes } from '@enzymefinance/subgraph-utils';
import { Address, Bytes, DataSourceContext, ethereum, crypto, BigInt } from '@graphprotocol/graph-ts';
import {
  createAaveDebtPosition,
  createAaveDebtPositionChange,
  trackAaveDebtPosition,
} from '../../entities/AaveDebtPosition';
import {
  createMapleLiquidityAssetAmount,
  createMapleLiquidityAssetAmountByPoolTokenAmount,
  createMapleLiquidityPosition,
  createMapleLiquidityPositionChange,
} from '../../entities/MapleLiquidityPosition';
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
import { Asset, AssetAmount } from '../../generated/schema';
import {
  ArbitraryLoanPositionLib4DataSource,
  MapleLiquidityPositionLib4DataSource,
  UniswapV3LiquidityPositionLib4DataSource,
} from '../../generated/templates';
import {
  AaveDebtPositionActionId,
  ArbitraryLoanPositionActionId,
  CompoundDebtPositionActionId,
  ConvexVotingPositionActionId,
  MapleLiquidityPositionActionId,
  UniswapV3LiquidityPositionActionId,
} from '../../utils/actionId';
import { ensureMapleLiquidityPool } from '../../entities/MapleLiquidityPool';
import { ExternalSdk } from '../../generated/contracts/ExternalSdk';
import {
  createConvexVotingPosition,
  createConvexVotingPositionChange,
  updateConvexVotingPositionWithdrawOrRelock,
  updateConvexVotingPositionUserLocks,
  useConvexVotingPosition,
} from '../../entities/ConvexVotingPosition';
import { cvxAddress } from '../../generated/addresses';
import {
  createUnknownExternalPosition,
  createUnknownExternalPositionChange,
} from '../../entities/UnknownExternalPosition';
import {
  createArbitraryLoanPosition,
  createArbitraryLoanPositionChange,
  useArbitraryLoanPosition,
} from '../../entities/ArbitraryLoanPosition';

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

  if (type.label == 'CONVEX_VOTING') {
    createConvexVotingPosition(event.params.externalPosition, event.params.vaultProxy, type);
    return;
  }

  if (type.label == 'ARBITRARY_LOAN') {
    createArbitraryLoanPosition(event.params.externalPosition, event.params.vaultProxy, type);

    ArbitraryLoanPositionLib4DataSource.create(event.params.externalPosition);

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

    trackCompoundDebtPosition(event.params.externalPosition.toHex(), event);
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

    trackAaveDebtPosition(event.params.externalPosition.toHex(), event);
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

  if (type.label == 'MAPLE_LIQUIDITY') {
    if (actionId == MapleLiquidityPositionActionId.Lend) {
      let decoded = ethereum.decode('(address,uint256)', event.params.actionArgs);

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();

      let poolAddress = tuple[0].toAddress();

      let pool = ensureMapleLiquidityPool(poolAddress);
      let assetAmount = createMapleLiquidityAssetAmount(pool, tuple[1].toBigInt(), denominationAsset, event);
      createMapleLiquidityPositionChange(event.params.externalPosition, pool, assetAmount, 'Lend', vault, event);
    }

    if (actionId == MapleLiquidityPositionActionId.LendAndStake) {
      let decoded = ethereum.decode('(address,address,uint256)', event.params.actionArgs);

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();

      let poolAddress = tuple[0].toAddress();
      let rewardsContractAddress = tuple[1].toAddress();

      let pool = ensureMapleLiquidityPool(poolAddress, rewardsContractAddress);
      let assetAmount = createMapleLiquidityAssetAmount(pool, tuple[2].toBigInt(), denominationAsset, event);
      createMapleLiquidityPositionChange(
        event.params.externalPosition,
        pool,
        assetAmount,
        'LendAndStake',
        vault,
        event,
      );
    }

    if (actionId == MapleLiquidityPositionActionId.IntendToRedeem) {
      let decoded = ethereum.decode('(address)', event.params.actionArgs);

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();

      let poolAddress = tuple[0].toAddress();

      let pool = ensureMapleLiquidityPool(poolAddress);
      createMapleLiquidityPositionChange(event.params.externalPosition, pool, null, 'IntendToRedeem', vault, event);
    }

    if (actionId == MapleLiquidityPositionActionId.Redeem) {
      let decoded = ethereum.decode('(address,uint256)', event.params.actionArgs);

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();

      let poolAddress = tuple[0].toAddress();

      let pool = ensureMapleLiquidityPool(poolAddress);
      let assetAmount = createMapleLiquidityAssetAmount(pool, tuple[1].toBigInt(), denominationAsset, event);
      createMapleLiquidityPositionChange(event.params.externalPosition, pool, assetAmount, 'Redeem', vault, event);
    }

    if (actionId == MapleLiquidityPositionActionId.Stake) {
      let decoded = ethereum.decode('(address,address,uint256)', event.params.actionArgs);

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();

      let rewardsContractAddress = tuple[0].toAddress();
      let poolAddress = tuple[1].toAddress();

      let pool = ensureMapleLiquidityPool(poolAddress, rewardsContractAddress);
      let assetAmount = createMapleLiquidityAssetAmount(pool, tuple[2].toBigInt(), denominationAsset, event);
      createMapleLiquidityPositionChange(event.params.externalPosition, pool, assetAmount, 'Stake', vault, event);
    }

    if (actionId == MapleLiquidityPositionActionId.Unstake) {
      let decoded = ethereum.decode('(address,uint256)', event.params.actionArgs);

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();

      let rewardsContractAddress = tuple[0].toAddress();

      let rewardsContract = ExternalSdk.bind(rewardsContractAddress);
      let poolAddress = rewardsContract.stakingToken();

      let pool = ensureMapleLiquidityPool(poolAddress, rewardsContractAddress);
      let assetAmount = createMapleLiquidityAssetAmountByPoolTokenAmount(
        pool,
        tuple[1].toBigInt(),
        denominationAsset,
        event,
      );
      createMapleLiquidityPositionChange(event.params.externalPosition, pool, assetAmount, 'Unstake', vault, event);
    }

    if (actionId == MapleLiquidityPositionActionId.UnstakeAndRedeem) {
      let decoded = ethereum.decode('(address,address,uint256)', event.params.actionArgs);

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();

      let poolAddress = tuple[0].toAddress();
      let rewardsContractAddress = tuple[1].toAddress();

      let pool = ensureMapleLiquidityPool(poolAddress, rewardsContractAddress);
      let assetAmount = createMapleLiquidityAssetAmountByPoolTokenAmount(
        pool,
        tuple[2].toBigInt(),
        denominationAsset,
        event,
      );
      createMapleLiquidityPositionChange(
        event.params.externalPosition,
        pool,
        assetAmount,
        'UnstakeAndRedeem',
        vault,
        event,
      );
    }

    if (actionId == MapleLiquidityPositionActionId.ClaimInterest) {
      let decoded = ethereum.decode('(address)', event.params.actionArgs);

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();

      let pool = ensureMapleLiquidityPool(tuple[0].toAddress());
      createMapleLiquidityPositionChange(event.params.externalPosition, pool, null, 'ClaimInterest', vault, event);
    }

    if (actionId == MapleLiquidityPositionActionId.ClaimRewards) {
      let decoded = ethereum.decode('(address)', event.params.actionArgs);

      if (decoded == null) {
        return;
      }

      let tuple = decoded.toTuple();

      let rewardsContractAddress = tuple[0].toAddress();

      let rewardsContract = ExternalSdk.bind(rewardsContractAddress);
      let poolAddress = rewardsContract.stakingToken();

      let pool = ensureMapleLiquidityPool(poolAddress, rewardsContractAddress);
      createMapleLiquidityPositionChange(event.params.externalPosition, pool, null, 'ClaimRewards', vault, event);
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

    // if (actionId == ConvexVotingPositionActionId.Relock) {
    //   updateConvexVotingPositionWithdrawOrRelock(event.params.externalPosition, event);
    //   createConvexVotingPositionChange(event.params.externalPosition, null, null, null, 'Relock', vault, event);
    // }

    // if (actionId == ConvexVotingPositionActionId.Withdraw) {
    //   updateConvexVotingPositionWithdrawOrRelock(event.params.externalPosition, event);
    //   createConvexVotingPositionChange(event.params.externalPosition, null, null, null, 'Withdraw', vault, event);
    // }

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

  createUnknownExternalPositionChange(event.params.externalPosition, vault, event);
}

export function handleExternalPositionTypeInfoUpdated(event: ExternalPositionTypeInfoUpdated): void {}
export function handleValidatedVaultProxySetForFund(event: ValidatedVaultProxySetForFund): void {}
