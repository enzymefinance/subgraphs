import { Address } from '@graphprotocol/graph-ts';

// NOTE: We consider addresses for a release to be immutable. Hence, we
// can statically define these in the code and don't need to spawn dynamic
// data sources for these. One place where this would be tempting for instance
// is the ComptrollerLibSet event. However, since all the addresses defined
// there are constant values both by convention but also simply through the
// way we deploy our protocol, we can use these addresses here.

export class Release2Addresses {
  fundDeployerAddress: Address;
  vaultLibAddress: Address;
  comptrollerLibAddress: Address;
  valueInterpreterAddress: Address;
  integrationManagerAddress: Address;
  policyManagerAddress: Address;
  feeManagerAddress: Address;
  aggregatedDerivativePriceFeedAddress: Address;
  chainlinkPriceFeedAddress: Address;
  managementFeeAddress: Address;
  performanceFeeAddress: Address;
  entranceRateBurnFeeAddress: Address;
  entranceRateDirectFeeAddress: Address;
  adapterBlacklistAddress: Address;
  adapterWhitelistAddress: Address;
  assetBlacklistAddress: Address;
  assetWhitelistAddress: Address;
  investorWhitelistAddress: Address;
  guaranteedRedemptionAddress: Address;
  maxConcentrationAddress: Address;
  minMaxInvestmentAddress: Address;
  buySharesCallerWhitelistAddress: Address;
}

export class Release3Addresses {
  fundDeployerAddress: Address;
  vaultLibAddress: Address;
  comptrollerLibAddress: Address;
  valueInterpreterAddress: Address;
  integrationManagerAddress: Address;
  policyManagerAddress: Address;
  feeManagerAddress: Address;
  aggregatedDerivativePriceFeedAddress: Address;
  chainlinkPriceFeedAddress: Address;
  managementFeeAddress: Address;
  performanceFeeAddress: Address;
  entranceRateBurnFeeAddress: Address;
  entranceRateDirectFeeAddress: Address;
  adapterBlacklistAddress: Address;
  adapterWhitelistAddress: Address;
  assetBlacklistAddress: Address;
  assetWhitelistAddress: Address;
  investorWhitelistAddress: Address;
  guaranteedRedemptionAddress: Address;
  maxConcentrationAddress: Address;
  minMaxInvestmentAddress: Address;
  buySharesCallerWhitelistAddress: Address;
}

export class Release4Addresses {
  fundDeployerAddress: Address;
  vaultLibAddress: Address;
  comptrollerLibAddress: Address;
  valueInterpreterAddress: Address;
  integrationManagerAddress: Address;
  policyManagerAddress: Address;
  feeManagerAddress: Address;
  globalConfigLibAddress: Address;
  managementFeeAddress: Address;
  performanceFeeAddress: Address;
  entranceRateBurnFeeAddress: Address;
  entranceRateDirectFeeAddress: Address;
  exitRateBurnFeeAddress: Address;
  exitRateDirectFeeAddress: Address;
  addressListRegistryAddress: Address;
  allowedAdapterIncomingAssetsPolicyAddress: Address;
  allowedAdaptersPolicyAddress: Address;
  allowedAssetsForRedemptionPolicyAddress: Address;
  allowedDepositRecipientsPolicyAddress: Address;
  allowedExternalPositionTypesPolicyAddress: Address;
  allowedSharesTransferRecipientsPolicyAddress: Address;
  cumulativeSlippageTolerancePolicyAddress: Address;
  guaranteedRedemptionPolicyAddress: Address;
  minMaxInvestmentPolicyAddress: Address;
  onlyUntrackDustOrPricelessAssetsPolicyAddress: Address;
  externalPositionFactoryAddress: Address;
  externalPositionManagerAddress: Address;
  gasRelayPaymasterFactoryAddress: Address;
  protocolFeeReserveLibAddress: Address;
  protocolFeeTrackerAddress: Address;
}

export let release2Addresses: Release2Addresses = {
  fundDeployerAddress: Address.fromString('{{release2.fundDeployerAddress}}'),
  vaultLibAddress: Address.fromString('{{release2.vaultLibAddress}}'),
  comptrollerLibAddress: Address.fromString('{{release2.comptrollerLibAddress}}'),
  valueInterpreterAddress: Address.fromString('{{release2.valueInterpreterAddress}}'),
  integrationManagerAddress: Address.fromString('{{release2.integrationManagerAddress}}'),
  policyManagerAddress: Address.fromString('{{release2.policyManagerAddress}}'),
  feeManagerAddress: Address.fromString('{{release2.feeManagerAddress}}'),

  // Prices
  aggregatedDerivativePriceFeedAddress: Address.fromString('{{release2.aggregatedDerivativePriceFeedAddress}}'),
  chainlinkPriceFeedAddress: Address.fromString('{{release2.chainlinkPriceFeedAddress}}'),

  // Fees
  managementFeeAddress: Address.fromString('{{release2.managementFeeAddress}}'),
  performanceFeeAddress: Address.fromString('{{release2.performanceFeeAddress}}'),
  entranceRateBurnFeeAddress: Address.fromString('{{release2.entranceRateBurnFeeAddress}}'),
  entranceRateDirectFeeAddress: Address.fromString('{{release2.entranceRateDirectFeeAddress}}'),

  // Policies
  adapterBlacklistAddress: Address.fromString('{{release2.adapterBlacklistAddress}}'),
  adapterWhitelistAddress: Address.fromString('{{release2.adapterWhitelistAddress}}'),
  assetBlacklistAddress: Address.fromString('{{release2.assetBlacklistAddress}}'),
  assetWhitelistAddress: Address.fromString('{{release2.assetWhitelistAddress}}'),
  investorWhitelistAddress: Address.fromString('{{release2.investorWhitelistAddress}}'),
  guaranteedRedemptionAddress: Address.fromString('{{release2.guaranteedRedemptionAddress}}'),
  maxConcentrationAddress: Address.fromString('{{release2.maxConcentrationAddress}}'),
  minMaxInvestmentAddress: Address.fromString('{{release2.minMaxInvestmentAddress}}'),
  buySharesCallerWhitelistAddress: Address.fromString('{{release2.buySharesCallerWhitelistAddress}}'),
};

export let release3Addresses: Release3Addresses = {
  fundDeployerAddress: Address.fromString('{{release3.fundDeployerAddress}}'),
  vaultLibAddress: Address.fromString('{{release3.vaultLibAddress}}'),
  comptrollerLibAddress: Address.fromString('{{release3.comptrollerLibAddress}}'),
  valueInterpreterAddress: Address.fromString('{{release3.valueInterpreterAddress}}'),
  integrationManagerAddress: Address.fromString('{{release3.integrationManagerAddress}}'),
  policyManagerAddress: Address.fromString('{{release3.policyManagerAddress}}'),
  feeManagerAddress: Address.fromString('{{release3.feeManagerAddress}}'),

  // Prices
  aggregatedDerivativePriceFeedAddress: Address.fromString('{{release3.aggregatedDerivativePriceFeedAddress}}'),
  chainlinkPriceFeedAddress: Address.fromString('{{release3.chainlinkPriceFeedAddress}}'),

  // Fees
  managementFeeAddress: Address.fromString('{{release3.managementFeeAddress}}'),
  performanceFeeAddress: Address.fromString('{{release3.performanceFeeAddress}}'),
  entranceRateBurnFeeAddress: Address.fromString('{{release3.entranceRateBurnFeeAddress}}'),
  entranceRateDirectFeeAddress: Address.fromString('{{release3.entranceRateDirectFeeAddress}}'),

  // Policies
  adapterBlacklistAddress: Address.fromString('{{release3.adapterBlacklistAddress}}'),
  adapterWhitelistAddress: Address.fromString('{{release3.adapterWhitelistAddress}}'),
  assetBlacklistAddress: Address.fromString('{{release3.assetBlacklistAddress}}'),
  assetWhitelistAddress: Address.fromString('{{release3.assetWhitelistAddress}}'),
  investorWhitelistAddress: Address.fromString('{{release3.investorWhitelistAddress}}'),
  guaranteedRedemptionAddress: Address.fromString('{{release3.guaranteedRedemptionAddress}}'),
  maxConcentrationAddress: Address.fromString('{{release3.maxConcentrationAddress}}'),
  minMaxInvestmentAddress: Address.fromString('{{release3.minMaxInvestmentAddress}}'),
  buySharesCallerWhitelistAddress: Address.fromString('{{release3.buySharesCallerWhitelistAddress}}'),
};

export let release4Addresses: Release4Addresses = {
  fundDeployerAddress: Address.fromString('{{release4.fundDeployerAddress}}'),
  vaultLibAddress: Address.fromString('{{release4.vaultLibAddress}}'),
  comptrollerLibAddress: Address.fromString('{{release4.comptrollerLibAddress}}'),
  valueInterpreterAddress: Address.fromString('{{release4.valueInterpreterAddress}}'),
  integrationManagerAddress: Address.fromString('{{release4.integrationManagerAddress}}'),
  policyManagerAddress: Address.fromString('{{release4.policyManagerAddress}}'),
  feeManagerAddress: Address.fromString('{{release4.feeManagerAddress}}'),
  globalConfigLibAddress: Address.fromString('{{release4.globalConfigLibAddress}}'),

  // Fees
  managementFeeAddress: Address.fromString('{{release4.managementFeeAddress}}'),
  performanceFeeAddress: Address.fromString('{{release4.performanceFeeAddress}}'),
  entranceRateBurnFeeAddress: Address.fromString('{{release4.entranceRateBurnFeeAddress}}'),
  entranceRateDirectFeeAddress: Address.fromString('{{release4.entranceRateDirectFeeAddress}}'),
  exitRateBurnFeeAddress: Address.fromString('{{release4.exitRateBurnFeeAddress}}'),
  exitRateDirectFeeAddress: Address.fromString('{{release4.exitRateDirectFeeAddress}}'),

  // Policies
  addressListRegistryAddress: Address.fromString('{{release4.addressListRegistryAddress}}'),
  allowedAdaptersPolicyAddress: Address.fromString('{{release4.allowedAdaptersPolicyAddress}}'),
  allowedAssetsForRedemptionPolicyAddress: Address.fromString('{{release4.allowedAssetsForRedemptionPolicyAddress}}'),
  allowedDepositRecipientsPolicyAddress: Address.fromString('{{release4.allowedDepositRecipientsPolicyAddress}}'),
  allowedExternalPositionTypesPolicyAddress: Address.fromString('{{release4.allowedExternalPositionTypesPolicyAddress}}'),
  allowedSharesTransferRecipientsPolicyAddress: Address.fromString('{{release4.allowedSharesTransferRecipientsPolicyAddress}}'),
  cumulativeSlippageTolerancePolicyAddress: Address.fromString('{{release4.cumulativeSlippageTolerancePolicyAddress}}'),
  onlyUntrackDustOrPricelessAssetsPolicyAddress: Address.fromString('{{release4.onlyUntrackDustOrPricelessAssetsPolicyAddress}}'),
  allowedAdapterIncomingAssetsPolicyAddress: Address.fromString(
    '{{release4.allowedAdapterIncomingAssetsPolicyAddress}}',
  ),
  guaranteedRedemptionPolicyAddress: Address.fromString('{{release4.guaranteedRedemptionPolicyAddress}}'),
  minMaxInvestmentPolicyAddress: Address.fromString('{{release4.minMaxInvestmentPolicyAddress}}'),

  // External Positions
  externalPositionFactoryAddress: Address.fromString('{{release4.externalPositionFactoryAddress}}'),
  externalPositionManagerAddress: Address.fromString('{{release4.externalPositionManagerAddress}}'),

  // Gas Relayer
  gasRelayPaymasterFactoryAddress: Address.fromString('{{release4.gasRelayPaymasterFactoryAddress}}'),

  // Protocol Feed
  protocolFeeReserveLibAddress: Address.fromString('{{release4.protocolFeeReserveLibAddress}}'),
  protocolFeeTrackerAddress: Address.fromString('{{release4.protocolFeeTrackerAddress}}'),
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
