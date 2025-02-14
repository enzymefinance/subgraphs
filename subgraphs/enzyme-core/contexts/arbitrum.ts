import { Context } from '@enzymefinance/subgraph-cli';
import { Variables } from '../subgraph.config';
import { Deployment, Version } from '@enzymefinance/environment';
import { getEnvironment } from '@enzymefinance/environment/deployments/all';

const environment = getEnvironment(Deployment.ARBITRUM, Version.SULU);

export const arbitrum: Context<Variables> = {
  name: 'enzyme-core-arbitrum',
  network: 'arbitrum-one',
  variables: {
    block: environment.deployment.inception,
    wethTokenAddress: environment.namedTokens.weth.id,
    wrappedNativeTokenAddress: environment.namedTokens.nativeTokenWrapper.id,
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
      grtAddress: environment.namedTokens.grt.id,
      theGraphStakingProxyAddress: environment.externalContracts.theGraphDelegationStakingProxy,
      lusdAddress: '0x0000000000000000000000000000000000000000',
      compAddress: environment.namedTokens.comp.id,
      // morphoBlueAddress: "0x0000000000000000000000000000000000000000",
      aliceOrderManager: '0x0000000000000000000000000000000000000000',
      stethAddress: '0x0000000000000000000000000000000000000000',
      ethxAddress: '0x0000000000000000000000000000000000000000',
    },
    persistent: {
      addressListRegistryAddress: environment.contracts.AddressListRegistry,
      dispatcherAddress: environment.contracts.Dispatcher,
      externalPositionFactoryAddress: environment.contracts.ExternalPositionFactory,
      gatedRedemptionQueueSharesWrapperFactoryAddress: environment.contracts.GatedRedemptionQueueSharesWrapperFactory,
      manualValueOracleFactoryAddress: environment.contracts.ManualValueOracleFactory,
      pendleMarketsRegistryAddress: environment.contracts.PendleMarketsRegistry,
      protocolFeeReserveLibAddress: environment.contracts.ProtocolFeeReserveLib,
      sharesSplitterFactoryAddress: environment.contracts.SharesSplitterFactory,
      singleAssetRedemptionQueueFactoryAddress: environment.contracts.SingleAssetRedemptionQueueFactory,
      singleAssetDepositQueueFactoryAddress: '0x0000000000000000000000000000000000000000',
      uintListRegistryAddress: environment.contracts.UintListRegistry,
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
        allowedAdapterIncomingAssetsPolicyAddress: environment.contracts.AllowedAdapterIncomingAssetsPolicy,
        allowedAdaptersPerManagerPolicyAddress: environment.contracts.AllowedAdaptersPerManagerPolicy,
        allowedAdaptersPolicyAddress: environment.contracts.AllowedAdaptersPolicy,
        allowedAssetsForRedemptionPolicyAddress: environment.contracts.AllowedAssetsForRedemptionPolicy,
        allowedDepositRecipientsPolicyAddress: environment.contracts.AllowedDepositRecipientsPolicy,
        allowedExternalPositionTypesPerManagerPolicyAddress:
          environment.contracts.AllowedExternalPositionTypesPerManagerPolicy,
        allowedExternalPositionTypesPolicyAddress: environment.contracts.AllowedExternalPositionTypesPolicy,
        allowedRedeemersForSpecificAssetsPolicyAddress: environment.contracts.AllowedRedeemersForSpecificAssetsPolicy,
        allowedSharesTransferRecipientsPolicyAddress: environment.contracts.AllowedSharesTransferRecipientsPolicy,
        arbitraryLoanTotalNominalDeltaOracleModuleAddress:
          environment.contracts.ArbitraryLoanTotalNominalDeltaOracleModule,
        auraBalancerV2LpStakingAdapterAddress: '0x0000000000000000000000000000000000000000',
        balancerV2LiquidityAdapterAddress: environment.contracts.BalancerV2LiquidityAdapter,
        convexCurveLpStakingAdapterAddress: '0x0000000000000000000000000000000000000000',
        compoundV3AdapterAddress: environment.contracts.CompoundV3Adapter,
        comptrollerLibAddress: environment.contracts.ComptrollerLib,
        cumulativeSlippageTolerancePolicyAddress: environment.contracts.CumulativeSlippageTolerancePolicy,
        curveLiquidityAdapterAddress: environment.contracts.CurveLiquidityAdapter,
        disallowedAdapterIncomingAssetsPolicyAddress: environment.contracts.DisallowedAdapterIncomingAssetsPolicy,
        entranceRateBurnFeeAddress: environment.contracts.EntranceRateBurnFee,
        entranceRateDirectFeeAddress: environment.contracts.EntranceRateDirectFee,
        exitRateBurnFeeAddress: environment.contracts.ExitRateBurnFee,
        exitRateDirectFeeAddress: environment.contracts.ExitRateDirectFee,
        externalPositionManagerAddress: environment.contracts.ExternalPositionManager,
        feeManagerAddress: environment.contracts.FeeManager,
        fundDeployerAddress: environment.contracts.FundDeployer,
        gasRelayPaymasterFactoryAddress: environment.contracts.GasRelayPaymasterFactory,
        integrationManagerAddress: environment.contracts.IntegrationManager,
        managementFeeAddress: environment.contracts.ManagementFee,
        minAssetBalancesPostRedemptionPolicyAddress: environment.contracts.MinAssetBalancesPostRedemptionPolicy,
        minMaxInvestmentPolicyAddress: environment.contracts.MinMaxInvestmentPolicy,
        minSharesSupplyFeeAddress: environment.contracts.MinSharesSupplyFee,
        noDepegOnRedeemSharesForSpecificAssetsPolicyAddress:
          environment.contracts.NoDepegOnRedeemSharesForSpecificAssetsPolicy,
        onlyRemoveDustExternalPositionPolicyAddress: environment.contracts.OnlyRemoveDustExternalPositionPolicy,
        onlyUntrackDustOrPricelessAssetsPolicyAddress: environment.contracts.OnlyUntrackDustOrPricelessAssetsPolicy,
        performanceFeeAddress: environment.contracts.PerformanceFee,
        policyManagerAddress: environment.contracts.PolicyManager,
        protocolFeeTrackerAddress: environment.contracts.ProtocolFeeTracker,
        unpermissionedActionsWrapperAddress: environment.contracts.UnpermissionedActionsWrapper,
        valueInterpreterAddress: environment.contracts.ValueInterpreter,
        vaultLibAddress: environment.contracts.VaultLib,
      },
    },
  },
};
