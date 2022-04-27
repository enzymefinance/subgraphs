import { DataSourceTemplateUserDeclaration, DataSourceUserDeclaration } from '@enzymefinance/subgraph-cli';

export interface ReleaseVariables {
  addressListRegistryAddress: string;
  allowedAdapterIncomingAssetsPolicyAddress: string;
  allowedAdaptersPolicyAddress: string;
  allowedAssetsForRedemptionPolicyAddress: string;
  allowedDepositRecipientsPolicyAddress: string;
  allowedExternalPositionTypesPolicyAddress: string;
  allowedSharesTransferRecipientsPolicyAddress: string;
  comptrollerLibAddress: string;
  cumulativeSlippageTolerancePolicyAddress: string;
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
  onlyRemoveDustExternalPositionPolicyAddress: string;
  onlyUntrackDustOrPricelessAssetsPolicyAddress: string;
  performanceFeeAddress: string;
  policyManagerAddress: string;
  protocolFeeReserveLibAddress: string;
  protocolFeeTrackerAddress: string;
  unpermissionedActionsWrapperAddress: string;
  valueInterpreterAddress: string;
  vaultLibAddress: string;
  curveLiquidityAdapterAddress: string;
}

export const sources = (variables: ReleaseVariables): DataSourceUserDeclaration[] => [
  { name: 'AddressListRegistry', address: variables.addressListRegistryAddress },
  { name: 'AllowedAdapterIncomingAssetsPolicy', address: variables.allowedAdapterIncomingAssetsPolicyAddress },
  { name: 'AllowedAdaptersPolicy', address: variables.allowedAdaptersPolicyAddress },
  { name: 'AllowedAssetsForRedemptionPolicy', address: variables.allowedAssetsForRedemptionPolicyAddress },
  { name: 'AllowedDepositRecipientsPolicy', address: variables.allowedDepositRecipientsPolicyAddress },
  { name: 'AllowedExternalPositionTypesPolicy', address: variables.allowedExternalPositionTypesPolicyAddress },
  { name: 'AllowedSharesTransferRecipientsPolicy', address: variables.allowedSharesTransferRecipientsPolicyAddress },
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
  { name: 'OnlyRemoveDustExternalPositionPolicy', address: variables.onlyRemoveDustExternalPositionPolicyAddress },
  { name: 'OnlyUntrackDustOrPricelessAssetsPolicy', address: variables.onlyUntrackDustOrPricelessAssetsPolicyAddress },
  { name: 'PerformanceFee', address: variables.performanceFeeAddress },
  { name: 'PolicyManager', address: variables.policyManagerAddress },
  { name: 'ProtocolFeeReserveLib', address: variables.protocolFeeReserveLibAddress },
  { name: 'ProtocolFeeTracker', address: variables.protocolFeeTrackerAddress },
  { name: 'ValueInterpreter', address: variables.valueInterpreterAddress },
];

export const templates: DataSourceTemplateUserDeclaration[] = [
  { name: 'VaultLib' },
  { name: 'ComptrollerLib' },
  { name: 'GasRelayPaymasterLib' },
  { name: 'UniswapV3LiquidityPositionLib' },
];
