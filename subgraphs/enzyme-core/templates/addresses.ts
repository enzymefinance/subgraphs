import { Address } from '@graphprotocol/graph-ts';

// NOTE: We consider addresses for a release to be immutable. Hence, we
// can statically define these in the code and don't need to spawn dynamic
// data sources for these. One place where this would be tempting for instance
// is the ComptrollerLibSet event. However, since all the addresses defined
// there are constant values both by convention but also simply through the
// way we deploy our protocol, we can use these addresses here.

export class Release2Addresses {
  adapterBlacklistAddress: Address;
  adapterWhitelistAddress: Address;
  aggregatedDerivativePriceFeedAddress: Address;
  assetBlacklistAddress: Address;
  assetWhitelistAddress: Address;
  buySharesCallerWhitelistAddress: Address;
  chainlinkPriceFeedAddress: Address;
  comptrollerLibAddress: Address;
  entranceRateBurnFeeAddress: Address;
  entranceRateDirectFeeAddress: Address;
  feeManagerAddress: Address;
  fundActionsWrapperAddress: Address;
  fundDeployerAddress: Address;
  guaranteedRedemptionAddress: Address;
  integrationManagerAddress: Address;
  investorWhitelistAddress: Address;
  managementFeeAddress: Address;
  maxConcentrationAddress: Address;
  minMaxInvestmentAddress: Address;
  performanceFeeAddress: Address;
  policyManagerAddress: Address;
  valueInterpreterAddress: Address;
  vaultLibAddress: Address;
}

export class Release3Addresses {
  adapterBlacklistAddress: Address;
  adapterWhitelistAddress: Address;
  aggregatedDerivativePriceFeedAddress: Address;
  assetBlacklistAddress: Address;
  assetWhitelistAddress: Address;
  buySharesCallerWhitelistAddress: Address;
  chainlinkPriceFeedAddress: Address;
  comptrollerLibAddress: Address;
  entranceRateBurnFeeAddress: Address;
  entranceRateDirectFeeAddress: Address;
  feeManagerAddress: Address;
  fundActionsWrapperAddress: Address;
  fundDeployerAddress: Address;
  guaranteedRedemptionAddress: Address;
  integrationManagerAddress: Address;
  investorWhitelistAddress: Address;
  managementFeeAddress: Address;
  maxConcentrationAddress: Address;
  minMaxInvestmentAddress: Address;
  performanceFeeAddress: Address;
  policyManagerAddress: Address;
  valueInterpreterAddress: Address;
  vaultLibAddress: Address;
}

export class Release4Addresses {
  addressListRegistryAddress: Address;
  allowedAdapterIncomingAssetsPolicyAddress: Address;
  allowedAdaptersPolicyAddress: Address;
  allowedAssetsForRedemptionPolicyAddress: Address;
  allowedDepositRecipientsPolicyAddress: Address;
  allowedExternalPositionTypesPolicyAddress: Address;
  allowedSharesTransferRecipientsPolicyAddress: Address;
  comptrollerLibAddress: Address;
  cumulativeSlippageTolerancePolicyAddress: Address;
  entranceRateBurnFeeAddress: Address;
  entranceRateDirectFeeAddress: Address;
  exitRateBurnFeeAddress: Address;
  exitRateDirectFeeAddress: Address;
  externalPositionFactoryAddress: Address;
  externalPositionManagerAddress: Address;
  feeManagerAddress: Address;
  fundDeployerAddress: Address;
  gasRelayPaymasterFactoryAddress: Address;
  globalConfigLibAddress: Address;
  guaranteedRedemptionPolicyAddress: Address;
  integrationManagerAddress: Address;
  managementFeeAddress: Address;
  minMaxInvestmentPolicyAddress: Address;
  onlyUntrackDustOrPricelessAssetsPolicyAddress: Address;
  performanceFeeAddress: Address;
  policyManagerAddress: Address;
  protocolFeeReserveLibAddress: Address;
  protocolFeeTrackerAddress: Address;
  unpermissionedActionsWrapperAddress: Address;
  valueInterpreterAddress: Address;
  vaultLibAddress: Address;
}

export let release2Addresses: Release2Addresses = {
  adapterBlacklistAddress: Address.fromString('{{release2.adapterBlacklistAddress}}'),
  adapterWhitelistAddress: Address.fromString('{{release2.adapterWhitelistAddress}}'),
  aggregatedDerivativePriceFeedAddress: Address.fromString('{{release2.aggregatedDerivativePriceFeedAddress}}'),
  assetBlacklistAddress: Address.fromString('{{release2.assetBlacklistAddress}}'),
  assetWhitelistAddress: Address.fromString('{{release2.assetWhitelistAddress}}'),
  buySharesCallerWhitelistAddress: Address.fromString('{{release2.buySharesCallerWhitelistAddress}}'),
  chainlinkPriceFeedAddress: Address.fromString('{{release2.chainlinkPriceFeedAddress}}'),
  comptrollerLibAddress: Address.fromString('{{release2.comptrollerLibAddress}}'),
  entranceRateBurnFeeAddress: Address.fromString('{{release2.entranceRateBurnFeeAddress}}'),
  entranceRateDirectFeeAddress: Address.fromString('{{release2.entranceRateDirectFeeAddress}}'),
  feeManagerAddress: Address.fromString('{{release2.feeManagerAddress}}'),
  fundActionsWrapperAddress: Address.fromString('{{release2.fundActionsWrapperAddress}}'),
  fundDeployerAddress: Address.fromString('{{release2.fundDeployerAddress}}'),
  guaranteedRedemptionAddress: Address.fromString('{{release2.guaranteedRedemptionAddress}}'),
  integrationManagerAddress: Address.fromString('{{release2.integrationManagerAddress}}'),
  investorWhitelistAddress: Address.fromString('{{release2.investorWhitelistAddress}}'),
  managementFeeAddress: Address.fromString('{{release2.managementFeeAddress}}'),
  maxConcentrationAddress: Address.fromString('{{release2.maxConcentrationAddress}}'),
  minMaxInvestmentAddress: Address.fromString('{{release2.minMaxInvestmentAddress}}'),
  performanceFeeAddress: Address.fromString('{{release2.performanceFeeAddress}}'),
  policyManagerAddress: Address.fromString('{{release2.policyManagerAddress}}'),
  valueInterpreterAddress: Address.fromString('{{release2.valueInterpreterAddress}}'),
  vaultLibAddress: Address.fromString('{{release2.vaultLibAddress}}'),
};

export let release3Addresses: Release3Addresses = {
  adapterBlacklistAddress: Address.fromString('{{release3.adapterBlacklistAddress}}'),
  adapterWhitelistAddress: Address.fromString('{{release3.adapterWhitelistAddress}}'),
  aggregatedDerivativePriceFeedAddress: Address.fromString('{{release3.aggregatedDerivativePriceFeedAddress}}'),
  assetBlacklistAddress: Address.fromString('{{release3.assetBlacklistAddress}}'),
  assetWhitelistAddress: Address.fromString('{{release3.assetWhitelistAddress}}'),
  buySharesCallerWhitelistAddress: Address.fromString('{{release3.buySharesCallerWhitelistAddress}}'),
  chainlinkPriceFeedAddress: Address.fromString('{{release3.chainlinkPriceFeedAddress}}'),
  comptrollerLibAddress: Address.fromString('{{release3.comptrollerLibAddress}}'),
  entranceRateBurnFeeAddress: Address.fromString('{{release3.entranceRateBurnFeeAddress}}'),
  entranceRateDirectFeeAddress: Address.fromString('{{release3.entranceRateDirectFeeAddress}}'),
  feeManagerAddress: Address.fromString('{{release3.feeManagerAddress}}'),
  fundActionsWrapperAddress: Address.fromString('{{release3.fundActionsWrapperAddress}}'),
  fundDeployerAddress: Address.fromString('{{release3.fundDeployerAddress}}'),
  guaranteedRedemptionAddress: Address.fromString('{{release3.guaranteedRedemptionAddress}}'),
  integrationManagerAddress: Address.fromString('{{release3.integrationManagerAddress}}'),
  investorWhitelistAddress: Address.fromString('{{release3.investorWhitelistAddress}}'),
  managementFeeAddress: Address.fromString('{{release3.managementFeeAddress}}'),
  maxConcentrationAddress: Address.fromString('{{release3.maxConcentrationAddress}}'),
  minMaxInvestmentAddress: Address.fromString('{{release3.minMaxInvestmentAddress}}'),
  performanceFeeAddress: Address.fromString('{{release3.performanceFeeAddress}}'),
  policyManagerAddress: Address.fromString('{{release3.policyManagerAddress}}'),
  valueInterpreterAddress: Address.fromString('{{release3.valueInterpreterAddress}}'),
  vaultLibAddress: Address.fromString('{{release3.vaultLibAddress}}'),
};

export let release4Addresses: Release4Addresses = {
  addressListRegistryAddress: Address.fromString('{{release4.addressListRegistryAddress}}'),
  allowedAdapterIncomingAssetsPolicyAddress: Address.fromString(
    '{{release4.allowedAdapterIncomingAssetsPolicyAddress}}',
    ),
  allowedAdaptersPolicyAddress: Address.fromString('{{release4.allowedAdaptersPolicyAddress}}'),
  allowedAssetsForRedemptionPolicyAddress: Address.fromString('{{release4.allowedAssetsForRedemptionPolicyAddress}}'),
  allowedDepositRecipientsPolicyAddress: Address.fromString('{{release4.allowedDepositRecipientsPolicyAddress}}'),
  allowedExternalPositionTypesPolicyAddress: Address.fromString('{{release4.allowedExternalPositionTypesPolicyAddress}}'),
  allowedSharesTransferRecipientsPolicyAddress: Address.fromString('{{release4.allowedSharesTransferRecipientsPolicyAddress}}'),
  comptrollerLibAddress: Address.fromString('{{release4.comptrollerLibAddress}}'),
  cumulativeSlippageTolerancePolicyAddress: Address.fromString('{{release4.cumulativeSlippageTolerancePolicyAddress}}'),
  entranceRateBurnFeeAddress: Address.fromString('{{release4.entranceRateBurnFeeAddress}}'),
  entranceRateDirectFeeAddress: Address.fromString('{{release4.entranceRateDirectFeeAddress}}'),
  exitRateBurnFeeAddress: Address.fromString('{{release4.exitRateBurnFeeAddress}}'),
  exitRateDirectFeeAddress: Address.fromString('{{release4.exitRateDirectFeeAddress}}'),
  externalPositionFactoryAddress: Address.fromString('{{release4.externalPositionFactoryAddress}}'),
  externalPositionManagerAddress: Address.fromString('{{release4.externalPositionManagerAddress}}'),
  feeManagerAddress: Address.fromString('{{release4.feeManagerAddress}}'),
  fundDeployerAddress: Address.fromString('{{release4.fundDeployerAddress}}'),
  gasRelayPaymasterFactoryAddress: Address.fromString('{{release4.gasRelayPaymasterFactoryAddress}}'),
  globalConfigLibAddress: Address.fromString('{{release4.globalConfigLibAddress}}'),
  guaranteedRedemptionPolicyAddress: Address.fromString('{{release4.guaranteedRedemptionPolicyAddress}}'),
  integrationManagerAddress: Address.fromString('{{release4.integrationManagerAddress}}'),
  managementFeeAddress: Address.fromString('{{release4.managementFeeAddress}}'),
  minMaxInvestmentPolicyAddress: Address.fromString('{{release4.minMaxInvestmentPolicyAddress}}'),
  onlyUntrackDustOrPricelessAssetsPolicyAddress: Address.fromString('{{release4.onlyUntrackDustOrPricelessAssetsPolicyAddress}}'),
  performanceFeeAddress: Address.fromString('{{release4.performanceFeeAddress}}'),
  policyManagerAddress: Address.fromString('{{release4.policyManagerAddress}}'),
  protocolFeeReserveLibAddress: Address.fromString('{{release4.protocolFeeReserveLibAddress}}'),
  protocolFeeTrackerAddress: Address.fromString('{{release4.protocolFeeTrackerAddress}}'),
  unpermissionedActionsWrapperAddress: Address.fromString('{{release4.protocolFeeTrackerAddress}}'),
  valueInterpreterAddress: Address.fromString('{{release4.valueInterpreterAddress}}'),
  vaultLibAddress: Address.fromString('{{release4.vaultLibAddress}}'),
};

// Core
export let dispatcherAddress = Address.fromString('{{dispatcherAddress}}');

// External
export let wethTokenAddress = Address.fromString('{{wethTokenAddress}}');

export class ChainlinkAggregatorAddresses {
  audUsdAddress: Address;
  btcEthAddress: Address;
  btcusdAddress: Address;
  chfusdAddress: Address;
  ethUsdAddress: Address;
  eurUsdAddress: Address;
  gbpUsdAddress: Address;
  jpyUsdAddress: Address;
}

export let chainlinkAggregatorAddresses: ChainlinkAggregatorAddresses = {
  audUsdAddress: Address.fromString('{{chainlinkAggregatorAddresses.audUsd}}'),
  btcEthAddress: Address.fromString('{{chainlinkAggregatorAddresses.btcEth}}'),
  btcusdAddress: Address.fromString('{{chainlinkAggregatorAddresses.btcusd}}'),
  chfusdAddress: Address.fromString('{{chainlinkAggregatorAddresses.chfusd}}'),
  ethUsdAddress: Address.fromString('{{chainlinkAggregatorAddresses.ethUsd}}'),
  eurUsdAddress: Address.fromString('{{chainlinkAggregatorAddresses.eurUsd}}'),
  gbpUsdAddress: Address.fromString('{{chainlinkAggregatorAddresses.gbpUsd}}'),
  jpyUsdAddress: Address.fromString('{{chainlinkAggregatorAddresses.jpyUsd}}'),
};
