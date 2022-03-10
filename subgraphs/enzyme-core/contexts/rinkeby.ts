import { Context } from '@enzymefinance/subgraph-cli';
import { Variables } from '../subgraph.config';
import { default as v4 } from '../../../deployments/rinkeby/v4.json';

export const rinkeby: Context<Variables> = {
  name: 'enzymefinance/enzyme-core-rinkeby',
  network: 'rinkeby',
  variables: {
    block: 9452021,
    dispatcherAddress: '0xdd54d3f1a3f8d5DDf45c812640d8fbAfd657f901',
    externalPositionFactoryAddress: v4.contracts.ExternalPositionFactory.address,
    wethTokenAddress: '0xc778417e063141139fce010982780140aa0cd5ab',
    chainlinkAggregatorAddresses: {
      audUsd: '0x21c095d2aDa464A294956eA058077F14F66535af',
      btcEth: '0x2431452A0010a43878bF198e170F6319Af6d27F4',
      btcusd: '0xECe365B379E1dD183B20fc5f022230C044d51404',
      chfusd: '0x5e601CF5EF284Bcd12decBDa189479413284E1d2',
      ethUsd: '0x8A753747A1Fa494EC906cE90E9f37563A8AF630e',
      eurUsd: '0x78F9e60608bF48a1155b4B2A5e31F32318a1d85F',
      gbpUsd: '0x7B17A813eEC55515Fb8F49F2ef51502bC54DD40F',
      jpyUsd: '0x3Ae2F46a2D84e3D5590ee6Ee5116B80caF77DeCA',
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
        addressListRegistryAddress: v4.contracts.AddressListRegistry.address,
        allowedAdapterIncomingAssetsPolicyAddress: v4.contracts.AllowedAdapterIncomingAssetsPolicy.address,
        allowedAdaptersPolicyAddress: v4.contracts.AllowedAdaptersPolicy.address,
        allowedAssetsForRedemptionPolicyAddress: v4.contracts.AllowedAssetsForRedemptionPolicy.address,
        allowedDepositRecipientsPolicyAddress: v4.contracts.AllowedDepositRecipientsPolicy.address,
        allowedExternalPositionTypesPolicyAddress: v4.contracts.AllowedExternalPositionTypesPolicy.address,
        allowedSharesTransferRecipientsPolicyAddress: v4.contracts.AllowedSharesTransferRecipientsPolicy.address,
        comptrollerLibAddress: v4.contracts.ComptrollerLib.address,
        cumulativeSlippageTolerancePolicyAddress: v4.contracts.CumulativeSlippageTolerancePolicy.address,
        entranceRateBurnFeeAddress: v4.contracts.EntranceRateBurnFee.address,
        entranceRateDirectFeeAddress: v4.contracts.EntranceRateDirectFee.address,
        exitRateBurnFeeAddress: v4.contracts.ExitRateBurnFee.address,
        exitRateDirectFeeAddress: v4.contracts.ExitRateDirectFee.address,
        externalPositionManagerAddress: v4.contracts.ExternalPositionManager.address,
        feeManagerAddress: v4.contracts.FeeManager.address,
        fundDeployerAddress: v4.contracts.FundDeployer.address,
        gasRelayPaymasterFactoryAddress: v4.contracts.GasRelayPaymasterFactory.address,
        integrationManagerAddress: v4.contracts.IntegrationManager.address,
        managementFeeAddress: v4.contracts.ManagementFee.address,
        minAssetBalancesPostRedemptionPolicyAddress: v4.contracts.MinAssetBalancesPostRedemptionPolicy.address,
        minMaxInvestmentPolicyAddress: v4.contracts.MinMaxInvestmentPolicy.address,
        onlyRemoveDustExternalPositionPolicyAddress: v4.contracts.OnlyRemoveDustExternalPositionPolicy.address,
        onlyUntrackDustOrPricelessAssetsPolicyAddress: v4.contracts.OnlyUntrackDustOrPricelessAssetsPolicy.address,
        performanceFeeAddress: v4.contracts.PerformanceFee.address,
        policyManagerAddress: v4.contracts.PolicyManager.address,
        protocolFeeReserveLibAddress: v4.contracts.ProtocolFeeReserveLib.address,
        protocolFeeTrackerAddress: v4.contracts.ProtocolFeeTracker.address,
        unpermissionedActionsWrapperAddress: v4.contracts.UnpermissionedActionsWrapper.address,
        valueInterpreterAddress: v4.contracts.ValueInterpreter.address,
        vaultLibAddress: v4.contracts.VaultLib.address,
      },
    },
  },
};
