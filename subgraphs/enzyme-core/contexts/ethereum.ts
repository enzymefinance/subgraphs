import { Context } from '@enzymefinance/subgraph-cli';
import { Variables } from '../subgraph.config';
import { getEnvironment } from '@enzymefinance/environment/all';
import { Deployment, Version } from '@enzymefinance/environment';

const v2Deployment = getEnvironment(Deployment.ETHEREUM, Version.PHOENIX);
const v3Deployment = getEnvironment(Deployment.ETHEREUM, Version.ENCORE);
const suluDeployment = getEnvironment(Deployment.ETHEREUM, Version.SULU);

export const ethereum: Context<Variables> = {
  name: 'enzymefinance/enzyme-core',
  network: 'mainnet',
  variables: {
    block: 11636493,
    wethTokenAddress: suluDeployment.namedTokens.weth.id,
    wrappedNativeTokenAddress: suluDeployment.namedTokens.nativeTokenWrapper.id,
    chainlinkAggregatorAddresses: {
      audUsd: '0x77f9710e7d0a19669a13c055f62cd80d313df022',
      btcEth: '0xdeb288f737066589598e9214e782fa5a8ed689e8',
      btcusd: '0xf4030086522a5beea4988f8ca5b36dbc97bee88c',
      chfusd: '0x449d117117838ffa61263b61da6301aa2a88b13a',
      ethUsd: '0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419',
      eurUsd: '0xb49f677943bc038e9857d61e7d053caa2c1734c1',
      gbpUsd: '0x5c0ab2d9b5a7ed9f470386e82bb36a3613cdd4b5',
      jpyUsd: '0xbce206cae7f0ec07b545edde332a47c2f75bbeb3',
    },
    external: {
      balancerMinterAddress: '0x239e55f427d44c3cc793f49bfb507ebe76638a2b',
      curveMinterAddress: suluDeployment.externalContracts.curveMinter,
      cvxLockerV2Address: suluDeployment.externalContracts.voteLockedConvexToken,
      cvxAddress: suluDeployment.namedTokens.cvx.id,
      mplAddress: suluDeployment.namedTokens.mpl.id,
      grtAddress: suluDeployment.namedTokens.grt.id,
      theGraphStakingProxyAddress: suluDeployment.externalContracts.theGraphStakingProxy,
      lusdAddress: '0x5f98805a4e8be255a32880fdec7f6728c6568ba0', // TODO: add LUSD to the environment
    },
    persistent: {
      addressListRegistryAddress: suluDeployment.contracts.AddressListRegistry,
      dispatcherAddress: suluDeployment.contracts.Dispatcher,
      externalPositionFactoryAddress: suluDeployment.contracts.ExternalPositionFactory,
      gatedRedemptionQueueSharesWrapperFactory: '0x0000000000000000000000000000000000000000', // TODO: update after new deployment
      protocolFeeReserveLibAddress: suluDeployment.contracts.ProtocolFeeReserveLib,
      sharesSplitterFactoryAddress: suluDeployment.contracts.SharesSplitterFactory,
      uintListRegistryAddress: suluDeployment.contracts.UintListRegistry,
    },
    releases: {
      v2: {
        adapterBlacklistAddress: v2Deployment.contracts.AdapterBlacklist,
        adapterWhitelistAddress: v2Deployment.contracts.AdapterWhitelist,
        aggregatedDerivativePriceFeedAddress: v2Deployment.contracts.AggregatedDerivativePriceFeed,
        assetBlacklistAddress: v2Deployment.contracts.AssetBlacklist,
        assetWhitelistAddress: v2Deployment.contracts.AssetWhitelist,
        buySharesCallerWhitelistAddress: v2Deployment.contracts.BuySharesCallerWhitelist,
        chainlinkPriceFeedAddress: v2Deployment.contracts.ChainlinkPriceFeed,
        comptrollerLibAddress: v2Deployment.contracts.ComptrollerLib,
        entranceRateBurnFeeAddress: v2Deployment.contracts.EntranceRateBurnFee,
        entranceRateDirectFeeAddress: v2Deployment.contracts.EntranceRateDirectFee,
        feeManagerAddress: v2Deployment.contracts.FeeManager,
        fundActionsWrapperAddress: v2Deployment.contracts.FundActionsWrapper,
        fundDeployerAddress: v2Deployment.contracts.FundDeployer,
        guaranteedRedemptionAddress: v2Deployment.contracts.GuaranteedRedemption,
        integrationManagerAddress: v2Deployment.contracts.IntegrationManager,
        investorWhitelistAddress: v2Deployment.contracts.InvestorWhitelist,
        managementFeeAddress: v2Deployment.contracts.ManagementFee,
        maxConcentrationAddress: v2Deployment.contracts.MaxConcentration,
        minMaxInvestmentAddress: v2Deployment.contracts.MinMaxInvestment,
        performanceFeeAddress: v2Deployment.contracts.PerformanceFee,
        policyManagerAddress: v2Deployment.contracts.PolicyManager,
        valueInterpreterAddress: v2Deployment.contracts.ValueInterpreter,
        vaultLibAddress: v2Deployment.contracts.VaultLib,
      },
      v3: {
        adapterBlacklistAddress: v3Deployment.contracts.AdapterBlacklist,
        adapterWhitelistAddress: v3Deployment.contracts.AdapterWhitelist,
        aggregatedDerivativePriceFeedAddress: v3Deployment.contracts.AggregatedDerivativePriceFeed,
        assetBlacklistAddress: v3Deployment.contracts.AssetBlacklist,
        assetWhitelistAddress: v3Deployment.contracts.AssetWhitelist,
        buySharesCallerWhitelistAddress: v3Deployment.contracts.BuySharesCallerWhitelist,
        chainlinkPriceFeedAddress: v3Deployment.contracts.ChainlinkPriceFeed,
        comptrollerLibAddress: v3Deployment.contracts.ComptrollerLib,
        entranceRateBurnFeeAddress: v3Deployment.contracts.EntranceRateBurnFee,
        entranceRateDirectFeeAddress: v3Deployment.contracts.EntranceRateDirectFee,
        feeManagerAddress: v3Deployment.contracts.FeeManager,
        fundActionsWrapperAddress: v3Deployment.contracts.FundActionsWrapper,
        fundDeployerAddress: v3Deployment.contracts.FundDeployer,
        guaranteedRedemptionAddress: v3Deployment.contracts.GuaranteedRedemption,
        integrationManagerAddress: v3Deployment.contracts.IntegrationManager,
        investorWhitelistAddress: v3Deployment.contracts.InvestorWhitelist,
        managementFeeAddress: v3Deployment.contracts.ManagementFee,
        maxConcentrationAddress: v3Deployment.contracts.MaxConcentration,
        minMaxInvestmentAddress: v3Deployment.contracts.MinMaxInvestment,
        performanceFeeAddress: v3Deployment.contracts.PerformanceFee,
        policyManagerAddress: v3Deployment.contracts.PolicyManager,
        valueInterpreterAddress: v3Deployment.contracts.ValueInterpreter,
        vaultLibAddress: v3Deployment.contracts.VaultLib,
      },
      v4: {
        allowedAdapterIncomingAssetsPolicyAddress: suluDeployment.contracts.AllowedAdapterIncomingAssetsPolicy,
        allowedAdaptersPerManagerPolicyAddress: suluDeployment.contracts.AllowedAdaptersPerManagerPolicy,
        allowedAdaptersPolicyAddress: suluDeployment.contracts.AllowedAdaptersPolicy,
        allowedAssetsForRedemptionPolicyAddress: suluDeployment.contracts.AllowedAssetsForRedemptionPolicy,
        allowedDepositRecipientsPolicyAddress: suluDeployment.contracts.AllowedDepositRecipientsPolicy,
        allowedExternalPositionTypesPerManagerPolicyAddress:
          suluDeployment.contracts.AllowedExternalPositionTypesPerManagerPolicy,
        allowedExternalPositionTypesPolicyAddress: suluDeployment.contracts.AllowedExternalPositionTypesPolicy,
        allowedSharesTransferRecipientsPolicyAddress: suluDeployment.contracts.AllowedSharesTransferRecipientsPolicy,
        arbitraryLoanFixedInterestModuleAddress: suluDeployment.contracts.ArbitraryLoanFixedInterestModule,
        arbitraryLoanTotalNominalDeltaOracleModuleAddress:
          suluDeployment.contracts.ArbitraryLoanTotalNominalDeltaOracleModule,
        auraBalancerV2LpStakingAdapterAddress: '0x581a1e865285144c32ebd8205ca144156920b5fd',
        balancerV2LiquidityAdapterAddress: '0xe65df28eeec94bf2d21192fccb67852e93179daa',
        comptrollerLibAddress: suluDeployment.contracts.ComptrollerLib,
        convexCurveLpStakingAdapterAddress: suluDeployment.contracts.ConvexCurveLpStakingAdapter,
        convexCurveLpStakingWrapperFactoryAddress: suluDeployment.contracts.ConvexCurveLpStakingWrapperFactory,
        cumulativeSlippageTolerancePolicyAddress: suluDeployment.contracts.CumulativeSlippageTolerancePolicy,
        curveLiquidityAdapterAddress: suluDeployment.contracts.CurveLiquidityAdapter,
        entranceRateBurnFeeAddress: suluDeployment.contracts.EntranceRateBurnFee,
        entranceRateDirectFeeAddress: suluDeployment.contracts.EntranceRateDirectFee,
        exitRateBurnFeeAddress: suluDeployment.contracts.ExitRateBurnFee,
        exitRateDirectFeeAddress: suluDeployment.contracts.ExitRateDirectFee,
        externalPositionManagerAddress: suluDeployment.contracts.ExternalPositionManager,
        feeManagerAddress: suluDeployment.contracts.FeeManager,
        fundDeployerAddress: suluDeployment.contracts.FundDeployer,
        gasRelayPaymasterFactoryAddress: suluDeployment.contracts.GasRelayPaymasterFactory,
        integrationManagerAddress: suluDeployment.contracts.IntegrationManager,
        managementFeeAddress: suluDeployment.contracts.ManagementFee,
        minAssetBalancesPostRedemptionPolicyAddress: suluDeployment.contracts.MinAssetBalancesPostRedemptionPolicy,
        minMaxInvestmentPolicyAddress: suluDeployment.contracts.MinMaxInvestmentPolicy,
        minSharesSupplyFeeAddress: suluDeployment.contracts.MinSharesSupplyFee,
        onlyRemoveDustExternalPositionPolicyAddress: suluDeployment.contracts.OnlyRemoveDustExternalPositionPolicy,
        onlyUntrackDustOrPricelessAssetsPolicyAddress: suluDeployment.contracts.OnlyUntrackDustOrPricelessAssetsPolicy,
        performanceFeeAddress: suluDeployment.contracts.PerformanceFee,
        policyManagerAddress: suluDeployment.contracts.PolicyManager,
        protocolFeeTrackerAddress: suluDeployment.contracts.ProtocolFeeTracker,
        unpermissionedActionsWrapperAddress: suluDeployment.contracts.UnpermissionedActionsWrapper,
        valueInterpreterAddress: suluDeployment.contracts.ValueInterpreter,
        vaultLibAddress: suluDeployment.contracts.VaultLib,
      },
    },
  },
};
