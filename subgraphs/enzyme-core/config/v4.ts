import { DataSourceTemplateUserDeclaration, DataSourceUserDeclaration } from '@enzymefinance/subgraph-cli';

export interface ReleaseVariables {
  allowedAdapterIncomingAssetsPolicyAddress: string;
  allowedAdaptersPerManagerPolicyAddress: string;
  allowedAdaptersPolicyAddress: string;
  allowedAssetsForRedemptionPolicyAddress: string;
  allowedDepositRecipientsPolicyAddress: string;
  allowedExternalPositionTypesPerManagerPolicyAddress: string;
  allowedExternalPositionTypesPolicyAddress: string;
  allowedSharesTransferRecipientsPolicyAddress: string;
  arbitraryLoanFixedInterestModuleAddress: string;
  arbitraryLoanTotalNominalDeltaOracleModuleAddress: string;
  comptrollerLibAddress: string;
  convexCurveLpStakingAdapterAddress: string;
  cumulativeSlippageTolerancePolicyAddress: string;
  curveLiquidityAdapterAddress: string;
  entranceRateBurnFeeAddress: string;
  entranceRateDirectFeeAddress: string;
  exitRateBurnFeeAddress: string;
  exitRateDirectFeeAddress: string;
  externalPositionManagerAddress: string;
  feeManagerAddress: string;
  fundDeployerAddress: string;
  gasRelayPaymasterFactoryAddress: string;
  integrationManagerAddress: string;
  managementFeeAddress: string;
  minAssetBalancesPostRedemptionPolicyAddress: string;
  minMaxInvestmentPolicyAddress: string;
  minSharesSupplyFeeAddress: string;
  onlyRemoveDustExternalPositionPolicyAddress: string;
  onlyUntrackDustOrPricelessAssetsPolicyAddress: string;
  performanceFeeAddress: string;
  policyManagerAddress: string;
  protocolFeeTrackerAddress: string;
  unpermissionedActionsWrapperAddress: string;
  valueInterpreterAddress: string;
  vaultLibAddress: string;
}

export const sources = (variables: ReleaseVariables): DataSourceUserDeclaration[] => [
  { name: 'AllowedAdapterIncomingAssetsPolicy', address: variables.allowedAdapterIncomingAssetsPolicyAddress },
  { name: 'AllowedAdaptersPerManagerPolicy', address: variables.allowedAdaptersPerManagerPolicyAddress },
  { name: 'AllowedAdaptersPolicy', address: variables.allowedAdaptersPolicyAddress },
  { name: 'AllowedAssetsForRedemptionPolicy', address: variables.allowedAssetsForRedemptionPolicyAddress },
  { name: 'AllowedDepositRecipientsPolicy', address: variables.allowedDepositRecipientsPolicyAddress },
  {
    name: 'AllowedExternalPositionTypesPerManagerPolicy',
    address: variables.allowedExternalPositionTypesPerManagerPolicyAddress,
  },
  { name: 'AllowedExternalPositionTypesPolicy', address: variables.allowedExternalPositionTypesPolicyAddress },
  { name: 'AllowedSharesTransferRecipientsPolicy', address: variables.allowedSharesTransferRecipientsPolicyAddress },
  { name: 'ArbitraryLoanFixedInterestModule', address: variables.arbitraryLoanFixedInterestModuleAddress },
  {
    name: 'ArbitraryLoanTotalNominalDeltaOracleModule',
    address: variables.arbitraryLoanTotalNominalDeltaOracleModuleAddress,
  },
  { name: 'CumulativeSlippageTolerancePolicy', address: variables.cumulativeSlippageTolerancePolicyAddress },
  { name: 'EntranceRateBurnFee', address: variables.entranceRateBurnFeeAddress },
  { name: 'EntranceRateDirectFee', address: variables.entranceRateDirectFeeAddress },
  { name: 'ExitRateBurnFee', address: variables.exitRateBurnFeeAddress },
  { name: 'ExitRateDirectFee', address: variables.exitRateDirectFeeAddress },
  { name: 'ExternalPositionManager', address: variables.externalPositionManagerAddress },
  { name: 'FeeManager', address: variables.feeManagerAddress },
  { name: 'FundDeployer', address: variables.fundDeployerAddress },
  { name: 'GasRelayPaymasterFactory', address: variables.gasRelayPaymasterFactoryAddress },
  { name: 'IntegrationManager', address: variables.integrationManagerAddress },
  { name: 'ManagementFee', address: variables.managementFeeAddress },
  { name: 'MinAssetBalancesPostRedemptionPolicy', address: variables.minAssetBalancesPostRedemptionPolicyAddress },
  { name: 'MinMaxInvestmentPolicy', address: variables.minMaxInvestmentPolicyAddress },
  { name: 'MinSharesSupplyFee', address: variables.minSharesSupplyFeeAddress },
  { name: 'OnlyRemoveDustExternalPositionPolicy', address: variables.onlyRemoveDustExternalPositionPolicyAddress },
  { name: 'OnlyUntrackDustOrPricelessAssetsPolicy', address: variables.onlyUntrackDustOrPricelessAssetsPolicyAddress },
  { name: 'PerformanceFee', address: variables.performanceFeeAddress },
  { name: 'PolicyManager', address: variables.policyManagerAddress },
  { name: 'ProtocolFeeTracker', address: variables.protocolFeeTrackerAddress },
  { name: 'ValueInterpreter', address: variables.valueInterpreterAddress },
];

export const templates: DataSourceTemplateUserDeclaration[] = [
  { name: 'VaultLib' },
  { name: 'ComptrollerLib' },
  { name: 'GasRelayPaymasterLib' },
  { name: 'UniswapV3LiquidityPositionLib' },
  { name: 'MapleLiquidityPositionLib' },
  { name: 'ArbitraryLoanPositionLib' },
];
