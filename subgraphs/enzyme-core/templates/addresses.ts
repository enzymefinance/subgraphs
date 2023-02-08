import { Address } from '@graphprotocol/graph-ts';

// NOTE: We consider addresses for a release to be immutable. Hence, we
// can statically define these in the code and don't need to spawn dynamic
// data sources for these. One place where this would be tempting for instance
// is the ComptrollerLibSet event. However, since all the addresses defined
// there are constant values both by convention but also simply through the
// way we deploy our protocol, we can use these addresses here.

export class PersistentAddresses {
  dispatcherAddress: Address;
}

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
  allowedAdapterIncomingAssetsPolicyAddress: Address;
  allowedAdaptersPerManagerPolicyAddress: Address;
  allowedAdaptersPolicyAddress: Address;
  allowedAssetsForRedemptionPolicyAddress: Address;
  allowedDepositRecipientsPolicyAddress: Address;
  allowedExternalPositionTypesPerManagerPolicyAddress: Address;
  allowedExternalPositionTypesPolicyAddress: Address;
  allowedSharesTransferRecipientsPolicyAddress: Address;
  balancerV2LiquidityAdapterAddress: Address;
  comptrollerLibAddress: Address;
  convexCurveLpStakingAdapterAddress: Address;
  convexCurveLpStakingWrapperFactoryAddress: Address;
  cumulativeSlippageTolerancePolicyAddress: Address;
  curveLiquidityAdapterAddress: Address;
  entranceRateBurnFeeAddress: Address;
  entranceRateDirectFeeAddress: Address;
  exitRateBurnFeeAddress: Address;
  exitRateDirectFeeAddress: Address;
  externalPositionManagerAddress: Address;
  feeManagerAddress: Address;
  fundDeployerAddress: Address;
  gasRelayPaymasterFactoryAddress: Address;
  integrationManagerAddress: Address;
  managementFeeAddress: Address;
  minAssetBalancesPostRedemptionPolicyAddress: Address;
  minMaxInvestmentPolicyAddress: Address;
  minSharesSupplyFeeAddress: Address;
  onlyRemoveDustExternalPositionPolicyAddress: Address;
  onlyUntrackDustOrPricelessAssetsPolicyAddress: Address;
  performanceFeeAddress: Address;
  policyManagerAddress: Address;
  protocolFeeTrackerAddress: Address;
  unpermissionedActionsWrapperAddress: Address;
  valueInterpreterAddress: Address;
  vaultLibAddress: Address;
}

export let persistentAddresses: PersistentAddresses = {
  dispatcherAddress: Address.fromString('{{persistent.dispatcherAddress}}'),
};

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
  allowedAdapterIncomingAssetsPolicyAddress: Address.fromString(
    '{{releases.v4.allowedAdapterIncomingAssetsPolicyAddress}}',
  ),
  allowedAdaptersPerManagerPolicyAddress: Address.fromString('{{releases.v4.allowedAdaptersPerManagerPolicyAddress}}'),
  allowedAdaptersPolicyAddress: Address.fromString('{{releases.v4.allowedAdaptersPolicyAddress}}'),
  allowedAssetsForRedemptionPolicyAddress: Address.fromString(
    '{{releases.v4.allowedAssetsForRedemptionPolicyAddress}}',
  ),
  allowedDepositRecipientsPolicyAddress: Address.fromString('{{releases.v4.allowedDepositRecipientsPolicyAddress}}'),
  allowedExternalPositionTypesPerManagerPolicyAddress: Address.fromString(
    '{{releases.v4.allowedExternalPositionTypesPerManagerPolicyAddress}}',
  ),
  allowedExternalPositionTypesPolicyAddress: Address.fromString(
    '{{releases.v4.allowedExternalPositionTypesPolicyAddress}}',
  ),
  allowedSharesTransferRecipientsPolicyAddress: Address.fromString(
    '{{releases.v4.allowedSharesTransferRecipientsPolicyAddress}}',
  ),
  balancerV2LiquidityAdapterAddress: Address.fromString('{{releases.v4.balancerV2LiquidityAdapterAddress}}'),
  comptrollerLibAddress: Address.fromString('{{releases.v4.comptrollerLibAddress}}'),
  convexCurveLpStakingAdapterAddress: Address.fromString('{{releases.v4.convexCurveLpStakingAdapterAddress}}'),
  convexCurveLpStakingWrapperFactoryAddress: Address.fromString('{{releases.v4.convexCurveLpStakingAdapterAddress}}'),
  cumulativeSlippageTolerancePolicyAddress: Address.fromString(
    '{{releases.v4.cumulativeSlippageTolerancePolicyAddress}}',
  ),
  curveLiquidityAdapterAddress: Address.fromString('{{releases.v4.curveLiquidityAdapterAddress}}'),
  entranceRateBurnFeeAddress: Address.fromString('{{releases.v4.entranceRateBurnFeeAddress}}'),
  entranceRateDirectFeeAddress: Address.fromString('{{releases.v4.entranceRateDirectFeeAddress}}'),
  exitRateBurnFeeAddress: Address.fromString('{{releases.v4.exitRateBurnFeeAddress}}'),
  exitRateDirectFeeAddress: Address.fromString('{{releases.v4.exitRateDirectFeeAddress}}'),
  externalPositionManagerAddress: Address.fromString('{{releases.v4.externalPositionManagerAddress}}'),
  feeManagerAddress: Address.fromString('{{releases.v4.feeManagerAddress}}'),
  fundDeployerAddress: Address.fromString('{{releases.v4.fundDeployerAddress}}'),
  gasRelayPaymasterFactoryAddress: Address.fromString('{{releases.v4.gasRelayPaymasterFactoryAddress}}'),
  integrationManagerAddress: Address.fromString('{{releases.v4.integrationManagerAddress}}'),
  managementFeeAddress: Address.fromString('{{releases.v4.managementFeeAddress}}'),
  minAssetBalancesPostRedemptionPolicyAddress: Address.fromString(
    '{{releases.v4.minAssetBalancesPostRedemptionPolicyAddress}}',
  ),
  minMaxInvestmentPolicyAddress: Address.fromString('{{releases.v4.minMaxInvestmentPolicyAddress}}'),
  minSharesSupplyFeeAddress: Address.fromString('{{releases.v4.minSharesSupplyFeeAddress}}'),
  onlyRemoveDustExternalPositionPolicyAddress: Address.fromString(
    '{{releases.v4.onlyRemoveDustExternalPositionPolicyAddress}}',
  ),
  onlyUntrackDustOrPricelessAssetsPolicyAddress: Address.fromString(
    '{{releases.v4.onlyUntrackDustOrPricelessAssetsPolicyAddress}}',
  ),
  performanceFeeAddress: Address.fromString('{{releases.v4.performanceFeeAddress}}'),
  policyManagerAddress: Address.fromString('{{releases.v4.policyManagerAddress}}'),
  protocolFeeTrackerAddress: Address.fromString('{{releases.v4.protocolFeeTrackerAddress}}'),
  unpermissionedActionsWrapperAddress: Address.fromString('{{releases.v4.protocolFeeTrackerAddress}}'),
  valueInterpreterAddress: Address.fromString('{{releases.v4.valueInterpreterAddress}}'),
  vaultLibAddress: Address.fromString('{{releases.v4.vaultLibAddress}}'),
};

// External
export let wethTokenAddress = Address.fromString('{{wethTokenAddress}}');

export let wrappedNativeTokenAddress = Address.fromString('{{wrappedNativeTokenAddress}}');

export let balancerMinterAddress = Address.fromString('{{external.balancerMinterAddress}}');

export let curveMinterAddress = Address.fromString('{{external.curveMinterAddress}}');

export let cvxAddress = Address.fromString('{{external.cvxAddress}}');

export let mplAddress = Address.fromString('{{external.mplAddress}}');

export let cvxLockerV2Address = Address.fromString('{{external.cvxLockerV2Address}}');

export let grtAddress = Address.fromString('{{external.grtAddress}}');

export let theGraphStakingProxyAddress = Address.fromString('{{external.theGraphStakingProxyAddress}}');

export let lusdAddress = Address.fromString('{{external.lusdAddress}}');

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
