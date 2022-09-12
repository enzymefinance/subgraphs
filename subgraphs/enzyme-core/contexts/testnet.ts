import { Context } from '@enzymefinance/subgraph-cli';
import { Variables } from '../subgraph.config';
import { getEnvironment } from '@enzymefinance/environment/all';
import { Deployment, Version } from '@enzymefinance/environment';

const testnetV4Deployment = getEnvironment(Deployment.TESTNET, Version.SULU);

export const testnet: Context<Variables> = {
  name: 'enzymefinance/enzyme-core-testnet',
  network: 'matic',
  variables: {
    block: 25731749,
    wethTokenAddress: testnetV4Deployment.namedTokens.weth.id,
    wrappedNativeTokenAddress: testnetV4Deployment.namedTokens.nativeTokenWrapper.id,
    chainlinkAggregatorAddresses: {
      audUsd: '0x062df9c4efd2030e243ffcc398b652e8b8f95c6f',
      btcEth: '0x19b0f0833c78c0848109e3842d34d2fdf2ca69ba',
      btcusd: '0xc907e116054ad103354f2d350fd2514433d57f6f',
      chfusd: '0xc76f762cedf0f78a439727861628e0fdfe1e70c2',
      ethUsd: '0xf9680d99d6c9589e2a93a78a04a279e509205945',
      eurUsd: '0x73366fe0aa0ded304479862808e02506fe556a98',
      gbpUsd: '0x099a2540848573e94fb1ca0fa420b00acbbc845a',
      jpyUsd: '0xd647a6fc9bc6402301583c91decc5989d8bc382d',
    },
    external: {
      curveMinterAddress: testnetV4Deployment.externalContracts.curveMinter,
      cvxLockerV2Address: testnetV4Deployment.externalContracts.voteLockedConvexToken,
      cvxAddress: testnetV4Deployment.namedTokens.cvx.id,
      lusdAddress: '0x0000000000000000000000000000000000000000',
    },
    persistent: {
      addressListRegistryAddress: testnetV4Deployment.contracts.AddressListRegistry,
      dispatcherAddress: testnetV4Deployment.contracts.Dispatcher,
      externalPositionFactoryAddress: testnetV4Deployment.contracts.ExternalPositionFactory,
      protocolFeeReserveLibAddress: testnetV4Deployment.contracts.ProtocolFeeReserveLib,
      sharesSplitterFactoryAddress: testnetV4Deployment.contracts.SharesSplitterFactory,
      uintListRegistryAddress: testnetV4Deployment.contracts.UintListRegistry,
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
        allowedAdapterIncomingAssetsPolicyAddress: testnetV4Deployment.contracts.AllowedAdapterIncomingAssetsPolicy,
        allowedAdaptersPerManagerPolicyAddress: testnetV4Deployment.contracts.AllowedAdaptersPerManagerPolicy,
        allowedAdaptersPolicyAddress: testnetV4Deployment.contracts.AllowedAdaptersPolicy,
        allowedAssetsForRedemptionPolicyAddress: testnetV4Deployment.contracts.AllowedAssetsForRedemptionPolicy,
        allowedDepositRecipientsPolicyAddress: testnetV4Deployment.contracts.AllowedDepositRecipientsPolicy,
        allowedExternalPositionTypesPerManagerPolicyAddress:
          testnetV4Deployment.contracts.AllowedExternalPositionTypesPerManagerPolicy,
        allowedExternalPositionTypesPolicyAddress: testnetV4Deployment.contracts.AllowedExternalPositionTypesPolicy,
        allowedSharesTransferRecipientsPolicyAddress:
          testnetV4Deployment.contracts.AllowedSharesTransferRecipientsPolicy,
        arbitraryLoanFixedInterestModuleAddress: testnetV4Deployment.contracts.ArbitraryLoanFixedInterestModule,
        arbitraryLoanTotalNominalDeltaOracleModuleAddress:
          testnetV4Deployment.contracts.ArbitraryLoanTotalNominalDeltaOracleModule,
        comptrollerLibAddress: testnetV4Deployment.contracts.ComptrollerLib,
        convexCurveLpStakingAdapterAddress: testnetV4Deployment.contracts.ConvexCurveLpStakingAdapter,
        cumulativeSlippageTolerancePolicyAddress: testnetV4Deployment.contracts.CumulativeSlippageTolerancePolicy,
        curveLiquidityAdapterAddress: testnetV4Deployment.contracts.CurveLiquidityAdapter,
        entranceRateBurnFeeAddress: testnetV4Deployment.contracts.EntranceRateBurnFee,
        entranceRateDirectFeeAddress: testnetV4Deployment.contracts.EntranceRateDirectFee,
        exitRateBurnFeeAddress: testnetV4Deployment.contracts.ExitRateBurnFee,
        exitRateDirectFeeAddress: testnetV4Deployment.contracts.ExitRateDirectFee,
        externalPositionManagerAddress: testnetV4Deployment.contracts.ExternalPositionManager,
        feeManagerAddress: testnetV4Deployment.contracts.FeeManager,
        fundDeployerAddress: testnetV4Deployment.contracts.FundDeployer,
        gasRelayPaymasterFactoryAddress: testnetV4Deployment.contracts.GasRelayPaymasterFactory,
        integrationManagerAddress: testnetV4Deployment.contracts.IntegrationManager,
        managementFeeAddress: testnetV4Deployment.contracts.ManagementFee,
        minAssetBalancesPostRedemptionPolicyAddress: testnetV4Deployment.contracts.MinAssetBalancesPostRedemptionPolicy,
        minMaxInvestmentPolicyAddress: testnetV4Deployment.contracts.MinMaxInvestmentPolicy,
        minSharesSupplyFeeAddress: testnetV4Deployment.contracts.MinSharesSupplyFee,
        onlyRemoveDustExternalPositionPolicyAddress: testnetV4Deployment.contracts.OnlyRemoveDustExternalPositionPolicy,
        onlyUntrackDustOrPricelessAssetsPolicyAddress:
          testnetV4Deployment.contracts.OnlyUntrackDustOrPricelessAssetsPolicy,
        performanceFeeAddress: testnetV4Deployment.contracts.PerformanceFee,
        policyManagerAddress: testnetV4Deployment.contracts.PolicyManager,
        protocolFeeTrackerAddress: testnetV4Deployment.contracts.ProtocolFeeTracker,
        unpermissionedActionsWrapperAddress: testnetV4Deployment.contracts.UnpermissionedActionsWrapper,
        valueInterpreterAddress: testnetV4Deployment.contracts.ValueInterpreter,
        vaultLibAddress: testnetV4Deployment.contracts.VaultLib,
      },
    },
  },
};
