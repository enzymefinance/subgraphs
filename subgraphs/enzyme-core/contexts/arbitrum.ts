import { Context } from '@enzymefinance/subgraph-cli';
import { Variables } from '../subgraph.config';
import { Deployment, Version } from '@enzymefinance/environment';

export const arbitrum: Context<Variables> = {
  name: 'enzyme-core-arbitrum',
  network: 'arbitrum-one',
  variables: {
    block: 228702052,
    wethTokenAddress: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
    wrappedNativeTokenAddress: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
    chainlinkAggregatorAddresses: {
      audUsd: '0x9854e9a850e7c354c1de177ea953a6b1fba8fc22',
      btcEth: '0xc5a90a6d7e4af242da238ffe279e9f2ba0c64b2e',
      btcusd: '0x6ce185860a4963106506c203335a2910413708e9',
      chfusd: '0xe32accc8c4ec03f6e75bd3621bfc9fbb234e1fc3',
      ethUsd: '0x639fe6ab55c921f74e7fac1ee960c0b6293ba612',
      eurUsd: '0xa14d53bc1f1c0f31b4aa3bd109344e5009051a84',
      gbpUsd: '0x9c4424fd84c6661f97d8d6b3fc3c1aac2bedd137',
      jpyUsd: '0x3dd6e51cb9cae717d5a8778cf79a04029f9cfdf8',
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
      addressListRegistryAddress: '0x39ab1faab866b0c259291e5aebb40d753964f702',
      dispatcherAddress: '0xe45ae6058e637f76dea18f04154f1e6b5b21249e',
      externalPositionFactoryAddress: '0xbfe1995bf59d6dec28a1de81bc6f0a9ad77e4ebf',
      gatedRedemptionQueueSharesWrapperFactoryAddress: '0x0000000000000000000000000000000000000000',
      pendleMarketsRegistryAddress: '0x0000000000000000000000000000000000000000',
      protocolFeeReserveLibAddress: '0x6043f1759c01e383546e367572744027189ce555',
      sharesSplitterFactoryAddress: '0x0000000000000000000000000000000000000000',
      singleAssetRedemptionQueueFactoryAddress: '0x0000000000000000000000000000000000000000',
      uintListRegistryAddress: '0xc2fa51e4574f705ce2b1801c0d46ec7c983586ac',
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
        comptrollerLibAddress: '0x470f6021ab1e28f58b50451534f836d4dd8fa1e0',
        convexCurveLpStakingAdapterAddress: '0x0000000000000000000000000000000000000000',
        convexCurveLpStakingWrapperFactoryAddress: '0x0000000000000000000000000000000000000000',
        cumulativeSlippageTolerancePolicyAddress: '0x0000000000000000000000000000000000000000',
        curveLiquidityAdapterAddress: '0x0000000000000000000000000000000000000000',
        entranceRateBurnFeeAddress: '0x0000000000000000000000000000000000000000',
        entranceRateDirectFeeAddress: '0x0000000000000000000000000000000000000000',
        exitRateBurnFeeAddress: '0x0000000000000000000000000000000000000000',
        exitRateDirectFeeAddress: '0x0000000000000000000000000000000000000000',
        externalPositionManagerAddress: '0x16078ea0c94ba8613c5e287fd13820692bf3dbac',
        feeManagerAddress: '0x1dadcaf8b42cecd339b17f5bd5cb6f43bf283208',
        fundDeployerAddress: '0x93a7493ead63b51fc2c67905dad1202cd593e683',
        gasRelayPaymasterFactoryAddress: '0x0000000000000000000000000000000000000000',
        integrationManagerAddress: '0x1fb87197c8b3cb1a687d6fdd16cb7e652cbc1f27',
        managementFeeAddress: '0x0000000000000000000000000000000000000000',
        minAssetBalancesPostRedemptionPolicyAddress: '0x0000000000000000000000000000000000000000',
        minMaxInvestmentPolicyAddress: '0x0000000000000000000000000000000000000000',
        minSharesSupplyFeeAddress: '0x0000000000000000000000000000000000000000',
        noDepegOnRedeemSharesForSpecificAssetsPolicyAddress: '0x0000000000000000000000000000000000000000',
        onlyRemoveDustExternalPositionPolicyAddress: '0x0000000000000000000000000000000000000000',
        onlyUntrackDustOrPricelessAssetsPolicyAddress: '0x0000000000000000000000000000000000000000',
        performanceFeeAddress: '0x0000000000000000000000000000000000000000',
        policyManagerAddress: '0x8aa66256c58afbc0db42bbf2648759d85cc00a58',
        protocolFeeTrackerAddress: '0x00f2ace550cc629250430fe3cc1aa5f11383386e',
        unpermissionedActionsWrapperAddress: '0x0000000000000000000000000000000000000000',
        valueInterpreterAddress: '0x32d94c6fb25fc6d7e84806122b331b8360c8222d',
        vaultLibAddress: '0x86ecccbbe268ccdb58d46a9057b2541f0770fe3b',
      },
    },
  },
};
