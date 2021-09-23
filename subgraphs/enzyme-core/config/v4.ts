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
  externalPositionFactoryAddress: string;
  externalPositionManagerAddress: string;
  feeManagerAddress: string;
  fundDeployerAddress: string;
  gasRelayPaymasterFactoryAddress: string;
  globalConfigLibAddress: string;
  guaranteedRedemptionPolicyAddress: string;
  integrationManagerAddress: string;
  managementFeeAddress: string;
  minMaxInvestmentPolicyAddress: string;
  onlyUntrackDustOrPricelessAssetsPolicyAddress: string;
  performanceFeeAddress: string;
  policyManagerAddress: string;
  protocolFeeReserveLibAddress: string;
  protocolFeeTrackerAddress: string;
  unpermissionedActionsWrapperAddress: string;
  valueInterpreterAddress: string;
  vaultLibAddress: string;
}

export const sources = (variables: ReleaseVariables): DataSourceUserDeclaration[] => [
  {
    name: 'AddressListRegistry',
    address: variables.addressListRegistryAddress,
  },
  {
    name: 'AllowedAdaptersPolicy',
    address: variables.allowedAdaptersPolicyAddress,
  },
  {
    name: 'AllowedAssetsForRedemptionPolicy',
    address: variables.allowedAssetsForRedemptionPolicyAddress,
  },
  {
    name: 'AllowedExternalPositionTypesPolicy',
    address: variables.allowedExternalPositionTypesPolicyAddress,
  },
  {
    name: 'AllowedSharesTransferRecipientsPolicy',
    address: variables.allowedSharesTransferRecipientsPolicyAddress,
  },
  {
    name: 'CumulativeSlippageTolerancePolicy',
    address: variables.cumulativeSlippageTolerancePolicyAddress,
  },
  {
    name: 'OnlyUntrackDustOrPricelessAssetsPolicy',
    address: variables.onlyUntrackDustOrPricelessAssetsPolicyAddress,
  },
  {
    name: 'AllowedAdapterIncomingAssetsPolicy',
    address: variables.allowedAdapterIncomingAssetsPolicyAddress,
  },
  {
    name: 'AllowedDepositRecipientsPolicy',
    address: variables.allowedDepositRecipientsPolicyAddress,
  },
  {
    name: 'EntranceRateBurnFee',
    address: variables.entranceRateBurnFeeAddress,
  },
  {
    name: 'EntranceRateDirectFee',
    address: variables.entranceRateDirectFeeAddress,
  },
  {
    name: 'ExitRateBurnFee',
    address: variables.exitRateBurnFeeAddress,
  },
  {
    name: 'ExitRateDirectFee',
    address: variables.exitRateDirectFeeAddress,
  },
  {
    name: 'ExternalPositionFactory',
    address: variables.externalPositionFactoryAddress,
  },
  {
    name: 'ExternalPositionManager',
    address: variables.externalPositionManagerAddress,
  },
  {
    name: 'FeeManager',
    address: variables.feeManagerAddress,
  },
  {
    name: 'FundDeployer',
    address: variables.fundDeployerAddress,
  },
  {
    name: 'GasRelayPaymasterFactory',
    address: variables.gasRelayPaymasterFactoryAddress,
  },
  {
    name: 'GlobalConfigLib',
    address: variables.globalConfigLibAddress,
  },
  {
    name: 'GuaranteedRedemptionPolicy',
    address: variables.guaranteedRedemptionPolicyAddress,
  },
  {
    name: 'IntegrationManager',
    address: variables.integrationManagerAddress,
  },
  {
    name: 'ManagementFee',
    address: variables.managementFeeAddress,
  },
  {
    name: 'MinMaxInvestmentPolicy',
    address: variables.minMaxInvestmentPolicyAddress,
  },
  {
    name: 'PerformanceFee',
    address: variables.performanceFeeAddress,
  },
  {
    name: 'PolicyManager',
    address: variables.policyManagerAddress,
  },
  {
    name: 'ProtocolFeeReserveLib',
    address: variables.protocolFeeReserveLibAddress,
  },
  {
    name: 'ProtocolFeeTracker',
    address: variables.protocolFeeTrackerAddress,
  },
  {
    name: 'ValueInterpreter',
    address: variables.valueInterpreterAddress,
  },
];

export const templates: DataSourceTemplateUserDeclaration[] = [
  {
    name: 'VaultLib',
  },
  {
    name: 'ComptrollerLib',
  },
  {
    name: 'GasRelayPaymasterLib',
  },
  {
    name: 'CompoundDebtPositionLib',
  },
];
