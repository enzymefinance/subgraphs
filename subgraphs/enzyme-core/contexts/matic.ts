import { Context } from '@enzymefinance/subgraph-cli';
import { Variables } from '../subgraph.config';

import polygon from '@enzymefinance/environment/polygon';

export const matic: Context<Variables> = {
  name: 'enzymefinance/enzyme-core-matic',
  network: 'matic',
  variables: {
    block: 25731749,
    dispatcherAddress: polygon.contracts.Dispatcher,
    externalPositionFactoryAddress: polygon.contracts.ExternalPositionFactory,
    wethTokenAddress: polygon.weth.id,
    chainlinkAggregatorAddresses: {
      audUsd: '0x062Df9C4efd2030e243ffCc398b652e8b8F95C6f',
      btcEth: '0x19b0F0833C78c0848109E3842D34d2fDF2cA69BA',
      btcusd: '0xc907E116054Ad103354f2D350FD2514433D57F6f',
      chfusd: '0xc76f762CedF0F78a439727861628E0fdfE1e70c2',
      ethUsd: '0xF9680D99D6C9589e2a93a78A04A279e509205945',
      eurUsd: '0x73366Fe0AA0Ded304479862808e02506FE556a98',
      gbpUsd: '0x099a2540848573e94fb1Ca0Fa420b00acbBc845a',
      jpyUsd: '0xD647a6fC9BC6402301583C91decC5989d8Bc382D',
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
        addressListRegistryAddress: polygon.contracts.AddressListRegistry,
        allowedAdapterIncomingAssetsPolicyAddress: polygon.contracts.AllowedAdapterIncomingAssetsPolicy,
        allowedAdaptersPolicyAddress: polygon.contracts.AllowedAdaptersPolicy,
        allowedAssetsForRedemptionPolicyAddress: polygon.contracts.AllowedAssetsForRedemptionPolicy,
        allowedDepositRecipientsPolicyAddress: polygon.contracts.AllowedDepositRecipientsPolicy,
        allowedExternalPositionTypesPolicyAddress: polygon.contracts.AllowedExternalPositionTypesPolicy,
        allowedSharesTransferRecipientsPolicyAddress: polygon.contracts.AllowedSharesTransferRecipientsPolicy,
        comptrollerLibAddress: polygon.contracts.ComptrollerLib,
        cumulativeSlippageTolerancePolicyAddress: polygon.contracts.CumulativeSlippageTolerancePolicy,
        entranceRateBurnFeeAddress: polygon.contracts.EntranceRateBurnFee,
        entranceRateDirectFeeAddress: polygon.contracts.EntranceRateDirectFee,
        exitRateBurnFeeAddress: polygon.contracts.ExitRateBurnFee,
        exitRateDirectFeeAddress: polygon.contracts.ExitRateDirectFee,
        externalPositionManagerAddress: polygon.contracts.ExternalPositionManager,
        feeManagerAddress: polygon.contracts.FeeManager,
        fundDeployerAddress: polygon.contracts.FundDeployer,
        gasRelayPaymasterFactoryAddress: polygon.contracts.GasRelayPaymasterFactory,
        integrationManagerAddress: polygon.contracts.IntegrationManager,
        managementFeeAddress: polygon.contracts.ManagementFee,
        minAssetBalancesPostRedemptionPolicyAddress: polygon.contracts.MinAssetBalancesPostRedemptionPolicy,
        minMaxInvestmentPolicyAddress: polygon.contracts.MinMaxInvestmentPolicy,
        onlyRemoveDustExternalPositionPolicyAddress: polygon.contracts.OnlyRemoveDustExternalPositionPolicy,
        onlyUntrackDustOrPricelessAssetsPolicyAddress: polygon.contracts.OnlyUntrackDustOrPricelessAssetsPolicy,
        performanceFeeAddress: polygon.contracts.PerformanceFee,
        policyManagerAddress: polygon.contracts.PolicyManager,
        protocolFeeReserveLibAddress: polygon.contracts.ProtocolFeeReserveLib,
        protocolFeeTrackerAddress: polygon.contracts.ProtocolFeeTracker,
        unpermissionedActionsWrapperAddress: polygon.contracts.UnpermissionedActionsWrapper,
        valueInterpreterAddress: polygon.contracts.ValueInterpreter,
        vaultLibAddress: polygon.contracts.VaultLib,
      },
    },
  },
};
