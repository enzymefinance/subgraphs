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
  integrationManagerAddress: Address;
  managementFeeAddress: Address;
  minAssetBalancesPostRedemptionPolicyAddress: Address;
  minMaxInvestmentPolicyAddress: Address;
  onlyRemoveDustExternalPositionPolicyAddress: Address;
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
  adapterBlacklistAddress: Address.fromString('{{releases.v2.adapterBlacklistAddress}}'),
  adapterWhitelistAddress: Address.fromString('{{releases.v2.adapterWhitelistAddress}}'),
  aggregatedDerivativePriceFeedAddress: Address.fromString('{{releases.v2.aggregatedDerivativePriceFeedAddress}}'),
  assetBlacklistAddress: Address.fromString('{{releases.v2.assetBlacklistAddress}}'),
  assetWhitelistAddress: Address.fromString('{{releases.v2.assetWhitelistAddress}}'),
  buySharesCallerWhitelistAddress: Address.fromString('{{releases.v2.buySharesCallerWhitelistAddress}}'),
  chainlinkPriceFeedAddress: Address.fromString('{{releases.v2.chainlinkPriceFeedAddress}}'),
  comptrollerLibAddress: Address.fromString('{{releases.v2.comptrollerLibAddress}}'),
  entranceRateBurnFeeAddress: Address.fromString('{{releases.v2.entranceRateBurnFeeAddress}}'),
  entranceRateDirectFeeAddress: Address.fromString('{{releases.v2.entranceRateDirectFeeAddress}}'),
  feeManagerAddress: Address.fromString('{{releases.v2.feeManagerAddress}}'),
  fundActionsWrapperAddress: Address.fromString('{{releases.v2.fundActionsWrapperAddress}}'),
  fundDeployerAddress: Address.fromString('{{releases.v2.fundDeployerAddress}}'),
  guaranteedRedemptionAddress: Address.fromString('{{releases.v2.guaranteedRedemptionAddress}}'),
  integrationManagerAddress: Address.fromString('{{releases.v2.integrationManagerAddress}}'),
  investorWhitelistAddress: Address.fromString('{{releases.v2.investorWhitelistAddress}}'),
  managementFeeAddress: Address.fromString('{{releases.v2.managementFeeAddress}}'),
  maxConcentrationAddress: Address.fromString('{{releases.v2.maxConcentrationAddress}}'),
  minMaxInvestmentAddress: Address.fromString('{{releases.v2.minMaxInvestmentAddress}}'),
  performanceFeeAddress: Address.fromString('{{releases.v2.performanceFeeAddress}}'),
  policyManagerAddress: Address.fromString('{{releases.v2.policyManagerAddress}}'),
  valueInterpreterAddress: Address.fromString('{{releases.v2.valueInterpreterAddress}}'),
  vaultLibAddress: Address.fromString('{{releases.v2.vaultLibAddress}}'),
};

export let release3Addresses: Release3Addresses = {
  adapterBlacklistAddress: Address.fromString('{{releases.v3.adapterBlacklistAddress}}'),
  adapterWhitelistAddress: Address.fromString('{{releases.v3.adapterWhitelistAddress}}'),
  aggregatedDerivativePriceFeedAddress: Address.fromString('{{releases.v3.aggregatedDerivativePriceFeedAddress}}'),
  assetBlacklistAddress: Address.fromString('{{releases.v3.assetBlacklistAddress}}'),
  assetWhitelistAddress: Address.fromString('{{releases.v3.assetWhitelistAddress}}'),
  buySharesCallerWhitelistAddress: Address.fromString('{{releases.v3.buySharesCallerWhitelistAddress}}'),
  chainlinkPriceFeedAddress: Address.fromString('{{releases.v3.chainlinkPriceFeedAddress}}'),
  comptrollerLibAddress: Address.fromString('{{releases.v3.comptrollerLibAddress}}'),
  entranceRateBurnFeeAddress: Address.fromString('{{releases.v3.entranceRateBurnFeeAddress}}'),
  entranceRateDirectFeeAddress: Address.fromString('{{releases.v3.entranceRateDirectFeeAddress}}'),
  feeManagerAddress: Address.fromString('{{releases.v3.feeManagerAddress}}'),
  fundActionsWrapperAddress: Address.fromString('{{releases.v3.fundActionsWrapperAddress}}'),
  fundDeployerAddress: Address.fromString('{{releases.v3.fundDeployerAddress}}'),
  guaranteedRedemptionAddress: Address.fromString('{{releases.v3.guaranteedRedemptionAddress}}'),
  integrationManagerAddress: Address.fromString('{{releases.v3.integrationManagerAddress}}'),
  investorWhitelistAddress: Address.fromString('{{releases.v3.investorWhitelistAddress}}'),
  managementFeeAddress: Address.fromString('{{releases.v3.managementFeeAddress}}'),
  maxConcentrationAddress: Address.fromString('{{releases.v3.maxConcentrationAddress}}'),
  minMaxInvestmentAddress: Address.fromString('{{releases.v3.minMaxInvestmentAddress}}'),
  performanceFeeAddress: Address.fromString('{{releases.v3.performanceFeeAddress}}'),
  policyManagerAddress: Address.fromString('{{releases.v3.policyManagerAddress}}'),
  valueInterpreterAddress: Address.fromString('{{releases.v3.valueInterpreterAddress}}'),
  vaultLibAddress: Address.fromString('{{releases.v3.vaultLibAddress}}'),
};

export let release4Addresses: Release4Addresses = {
  addressListRegistryAddress: Address.fromString('{{releases.v4.addressListRegistryAddress}}'),
  allowedAdapterIncomingAssetsPolicyAddress: Address.fromString('{{releases.v4.allowedAdapterIncomingAssetsPolicyAddress}}'),
  allowedAdaptersPolicyAddress: Address.fromString('{{releases.v4.allowedAdaptersPolicyAddress}}'),
  allowedAssetsForRedemptionPolicyAddress: Address.fromString('{{releases.v4.allowedAssetsForRedemptionPolicyAddress}}'),
  allowedDepositRecipientsPolicyAddress: Address.fromString('{{releases.v4.allowedDepositRecipientsPolicyAddress}}'),
  allowedExternalPositionTypesPolicyAddress: Address.fromString('{{releases.v4.allowedExternalPositionTypesPolicyAddress}}'),
  allowedSharesTransferRecipientsPolicyAddress: Address.fromString('{{releases.v4.allowedSharesTransferRecipientsPolicyAddress}}'),
  comptrollerLibAddress: Address.fromString('{{releases.v4.comptrollerLibAddress}}'),
  cumulativeSlippageTolerancePolicyAddress: Address.fromString('{{releases.v4.cumulativeSlippageTolerancePolicyAddress}}'),
  entranceRateBurnFeeAddress: Address.fromString('{{releases.v4.entranceRateBurnFeeAddress}}'),
  entranceRateDirectFeeAddress: Address.fromString('{{releases.v4.entranceRateDirectFeeAddress}}'),
  exitRateBurnFeeAddress: Address.fromString('{{releases.v4.exitRateBurnFeeAddress}}'),
  exitRateDirectFeeAddress: Address.fromString('{{releases.v4.exitRateDirectFeeAddress}}'),
  externalPositionFactoryAddress: Address.fromString('{{releases.v4.externalPositionFactoryAddress}}'),
  externalPositionManagerAddress: Address.fromString('{{releases.v4.externalPositionManagerAddress}}'),
  feeManagerAddress: Address.fromString('{{releases.v4.feeManagerAddress}}'),
  fundDeployerAddress: Address.fromString('{{releases.v4.fundDeployerAddress}}'),
  gasRelayPaymasterFactoryAddress: Address.fromString('{{releases.v4.gasRelayPaymasterFactoryAddress}}'),
  integrationManagerAddress: Address.fromString('{{releases.v4.integrationManagerAddress}}'),
  managementFeeAddress: Address.fromString('{{releases.v4.managementFeeAddress}}'),
  minAssetBalancesPostRedemptionPolicyAddress: Address.fromString('{{releases.v4.minAssetBalancesPostRedemptionPolicyAddress}}'),
  minMaxInvestmentPolicyAddress: Address.fromString('{{releases.v4.minMaxInvestmentPolicyAddress}}'),
  onlyRemoveDustExternalPositionPolicyAddress: Address.fromString('{{releases.v4.onlyRemoveDustExternalPositionPolicyAddress}}'),
  onlyUntrackDustOrPricelessAssetsPolicyAddress: Address.fromString('{{releases.v4.onlyUntrackDustOrPricelessAssetsPolicyAddress}}'),
  performanceFeeAddress: Address.fromString('{{releases.v4.performanceFeeAddress}}'),
  policyManagerAddress: Address.fromString('{{releases.v4.policyManagerAddress}}'),
  protocolFeeReserveLibAddress: Address.fromString('{{releases.v4.protocolFeeReserveLibAddress}}'),
  protocolFeeTrackerAddress: Address.fromString('{{releases.v4.protocolFeeTrackerAddress}}'),
  unpermissionedActionsWrapperAddress: Address.fromString('{{releases.v4.protocolFeeTrackerAddress}}'),
  valueInterpreterAddress: Address.fromString('{{releases.v4.valueInterpreterAddress}}'),
  vaultLibAddress: Address.fromString('{{releases.v4.vaultLibAddress}}'),
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
