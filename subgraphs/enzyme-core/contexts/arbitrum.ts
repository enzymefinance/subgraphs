import { Context } from '@enzymefinance/subgraph-cli';
import { Variables } from '../subgraph.config';
import { Deployment, Version } from '@enzymefinance/environment';

export const arbitrum: Context<Variables> = {
  name: 'enzyme-core-arbitrum',
  network: 'matic',
  variables: {
    block: 1,
    wethTokenAddress: '0x0000000000000000000000000000000000000000',
    wrappedNativeTokenAddress: '0x0000000000000000000000000000000000000000',
    chainlinkAggregatorAddresses: {
      audUsd: '0x0000000000000000000000000000000000000000',
      btcEth: '0x0000000000000000000000000000000000000000',
      btcusd: '0x0000000000000000000000000000000000000000',
      chfusd: '0x0000000000000000000000000000000000000000',
      ethUsd: '0x0000000000000000000000000000000000000000',
      eurUsd: '0x0000000000000000000000000000000000000000',
      gbpUsd: '0x0000000000000000000000000000000000000000',
      jpyUsd: '0x0000000000000000000000000000000000000000',
    },
    external: {
      balancerMinterAddress: '0x0000000000000000000000000000000000000000',
      curveMinterAddress: '0x0000000000000000000000000000000000000000',
      cvxLockerV2Address: '0x0000000000000000000000000000000000000000',
      cvxAddress: '0x0000000000000000000000000000000000000000',
      mplAddress: '0x0000000000000000000000000000000000000000',
      grtAddress: '0x0000000000000000000000000000000000000000',
      theGraphStakingProxyAddress: '0x0000000000000000000000000000000000000000',
      lusdAddress: '0x0000000000000000000000000000000000000000',
      compAddress: '0x0000000000000000000000000000000000000000',
      // morphoBlueAddress: "0x0000000000000000000000000000000000000000",
    },
    persistent: {
      addressListRegistryAddress: '0x0000000000000000000000000000000000000000',
      dispatcherAddress: '0x0000000000000000000000000000000000000000',
      externalPositionFactoryAddress: '0x0000000000000000000000000000000000000000',
      gatedRedemptionQueueSharesWrapperFactoryAddress: '0x0000000000000000000000000000000000000000',
      pendleMarketsRegistryAddress: '0x0000000000000000000000000000000000000000',
      protocolFeeReserveLibAddress: '0x0000000000000000000000000000000000000000',
      sharesSplitterFactoryAddress: '0x0000000000000000000000000000000000000000',
      singleAssetRedemptionQueueFactoryAddress: '0x0000000000000000000000000000000000000000',
      uintListRegistryAddress: '0x0000000000000000000000000000000000000000',
    },
    releases: {
      v2: {
        adapterBlacklistAddress: '0x0000000000000000000000000000000000000000',
        adapterWhitelistAddress: '0x0000000000000000000000000000000000000000',
        aggregatedDerivativePriceFeedAddress: '0x0000000000000000000000000000000000000000',
        assetBlacklistAddress: '0x0000000000000000000000000000000000000000',
        assetWhitelistAddress: '0x0000000000000000000000000000000000000000',
        buySharesCallerWhitelistAddress: '0x0000000000000000000000000000000000000000',
        chainlinkPriceFeedAddress: '0x0000000000000000000000000000000000000000',
        comptrollerLibAddress: '0x0000000000000000000000000000000000000000',
        entranceRateBurnFeeAddress: '0x0000000000000000000000000000000000000000',
        entranceRateDirectFeeAddress: '0x0000000000000000000000000000000000000000',
        feeManagerAddress: '0x0000000000000000000000000000000000000000',
        fundActionsWrapperAddress: '0x0000000000000000000000000000000000000000',
        fundDeployerAddress: '0x0000000000000000000000000000000000000000',
        guaranteedRedemptionAddress: '0x0000000000000000000000000000000000000000',
        integrationManagerAddress: '0x0000000000000000000000000000000000000000',
        investorWhitelistAddress: '0x0000000000000000000000000000000000000000',
        managementFeeAddress: '0x0000000000000000000000000000000000000000',
        maxConcentrationAddress: '0x0000000000000000000000000000000000000000',
        minMaxInvestmentAddress: '0x0000000000000000000000000000000000000000',
        performanceFeeAddress: '0x0000000000000000000000000000000000000000',
        policyManagerAddress: '0x0000000000000000000000000000000000000000',
        valueInterpreterAddress: '0x0000000000000000000000000000000000000000',
        vaultLibAddress: '0x0000000000000000000000000000000000000000',
      },
      v3: {
        adapterBlacklistAddress: '0x0000000000000000000000000000000000000000',
        adapterWhitelistAddress: '0x0000000000000000000000000000000000000000',
        aggregatedDerivativePriceFeedAddress: '0x0000000000000000000000000000000000000000',
        assetBlacklistAddress: '0x0000000000000000000000000000000000000000',
        assetWhitelistAddress: '0x0000000000000000000000000000000000000000',
        buySharesCallerWhitelistAddress: '0x0000000000000000000000000000000000000000',
        chainlinkPriceFeedAddress: '0x0000000000000000000000000000000000000000',
        comptrollerLibAddress: '0x0000000000000000000000000000000000000000',
        entranceRateBurnFeeAddress: '0x0000000000000000000000000000000000000000',
        entranceRateDirectFeeAddress: '0x0000000000000000000000000000000000000000',
        feeManagerAddress: '0x0000000000000000000000000000000000000000',
        fundActionsWrapperAddress: '0x0000000000000000000000000000000000000000',
        fundDeployerAddress: '0x0000000000000000000000000000000000000000',
        guaranteedRedemptionAddress: '0x0000000000000000000000000000000000000000',
        integrationManagerAddress: '0x0000000000000000000000000000000000000000',
        investorWhitelistAddress: '0x0000000000000000000000000000000000000000',
        managementFeeAddress: '0x0000000000000000000000000000000000000000',
        maxConcentrationAddress: '0x0000000000000000000000000000000000000000',
        minMaxInvestmentAddress: '0x0000000000000000000000000000000000000000',
        performanceFeeAddress: '0x0000000000000000000000000000000000000000',
        policyManagerAddress: '0x0000000000000000000000000000000000000000',
        valueInterpreterAddress: '0x0000000000000000000000000000000000000000',
        vaultLibAddress: '0x0000000000000000000000000000000000000000',
      },
      v4: {
        allowedAdapterIncomingAssetsPolicyAddress: '0x0000000000000000000000000000000000000000',
        allowedAdaptersPerManagerPolicyAddress: '0x0000000000000000000000000000000000000000',
        allowedAdaptersPolicyAddress: '0x0000000000000000000000000000000000000000',
        allowedAssetsForRedemptionPolicyAddress: '0x0000000000000000000000000000000000000000',
        allowedDepositRecipientsPolicyAddress: '0x0000000000000000000000000000000000000000',
        allowedExternalPositionTypesPerManagerPolicyAddress: '0x0000000000000000000000000000000000000000',
        allowedExternalPositionTypesPolicyAddress: '0x0000000000000000000000000000000000000000',
        allowedRedeemersForSpecificAssetsPolicyAddress: '0x0000000000000000000000000000000000000000',
        allowedSharesTransferRecipientsPolicyAddress: '0x0000000000000000000000000000000000000000',
        arbitraryLoanFixedInterestModuleAddress: '0x0000000000000000000000000000000000000000',
        arbitraryLoanTotalNominalDeltaOracleModuleAddress: '0x0000000000000000000000000000000000000000',
        auraBalancerV2LpStakingAdapterAddress: '0x0000000000000000000000000000000000000000',
        balancerV2LiquidityAdapterAddress: '0x0000000000000000000000000000000000000000',
        compoundV3AdapterAddress: '0x0000000000000000000000000000000000000000',
        comptrollerLibAddress: '0x0000000000000000000000000000000000000000',
        convexCurveLpStakingAdapterAddress: '0x0000000000000000000000000000000000000000',
        convexCurveLpStakingWrapperFactoryAddress: '0x0000000000000000000000000000000000000000',
        cumulativeSlippageTolerancePolicyAddress: '0x0000000000000000000000000000000000000000',
        curveLiquidityAdapterAddress: '0x0000000000000000000000000000000000000000',
        entranceRateBurnFeeAddress: '0x0000000000000000000000000000000000000000',
        entranceRateDirectFeeAddress: '0x0000000000000000000000000000000000000000',
        exitRateBurnFeeAddress: '0x0000000000000000000000000000000000000000',
        exitRateDirectFeeAddress: '0x0000000000000000000000000000000000000000',
        externalPositionManagerAddress: '0x0000000000000000000000000000000000000000',
        feeManagerAddress: '0x0000000000000000000000000000000000000000',
        fundDeployerAddress: '0x0000000000000000000000000000000000000000',
        gasRelayPaymasterFactoryAddress: '0x0000000000000000000000000000000000000000',
        integrationManagerAddress: '0x0000000000000000000000000000000000000000',
        managementFeeAddress: '0x0000000000000000000000000000000000000000',
        minAssetBalancesPostRedemptionPolicyAddress: '0x0000000000000000000000000000000000000000',
        minMaxInvestmentPolicyAddress: '0x0000000000000000000000000000000000000000',
        minSharesSupplyFeeAddress: '0x0000000000000000000000000000000000000000',
        noDepegOnRedeemSharesForSpecificAssetsPolicyAddress: '0x0000000000000000000000000000000000000000',
        onlyRemoveDustExternalPositionPolicyAddress: '0x0000000000000000000000000000000000000000',
        onlyUntrackDustOrPricelessAssetsPolicyAddress: '0x0000000000000000000000000000000000000000',
        performanceFeeAddress: '0x0000000000000000000000000000000000000000',
        policyManagerAddress: '0x0000000000000000000000000000000000000000',
        protocolFeeTrackerAddress: '0x0000000000000000000000000000000000000000',
        unpermissionedActionsWrapperAddress: '0x0000000000000000000000000000000000000000',
        valueInterpreterAddress: '0x0000000000000000000000000000000000000000',
        vaultLibAddress: '0x0000000000000000000000000000000000000000',
      },
    },
  },
};
