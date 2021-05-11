import { Address } from '@graphprotocol/graph-ts';

// NOTE: We consider addresses for a release to be immutable. Hence, we
// can statically define these in the code and don't need to spawn dynamic
// data sources for these. One place where this would be tempting for instance
// is the ComptrollerLibSet event. However, since all the addresses defined
// there are constant values both by convention but also simply through the
// way we deploy our protocol, we can use these addresses here.

export class ReleaseAddresses {
  fundDeployerAddress: Address;
  vaultLibAddress: Address;
  comptrollerLibAddress: Address;
  valueInterpreterAddress: Address;
  integrationManagerAddress: Address;
  policyManagerAddress: Address;
  feeManagerAddress: Address;
  aggregatedDerivativePriceFeedAddress: Address;
  chainlinkPriceFeedAddress: Address;
  aavePriceFeedAddress: Address;
  alphaHomoraV1PriceFeedAddress: Address;
  chaiPriceFeedAddress: Address;
  compoundPriceFeedAddress: Address;
  curvePriceFeedAddress: Address;
  idlePriceFeedAddress: Address;
  lidoStethPriceFeedAddress: Address;
  stakehoundEthPriceFeedAddress: Address;
  synthetixPriceFeedAddress: Address;
  uniswapV2PoolPriceFeedAddress: Address;
  wdgldPriceFeedAddress: Address;
  fundActionsWrapperAddress: Address;
  authUserExecutedSharesRequestorFactoryAddress: Address;
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
  aaveAdapterAddress: Address;
  alphaHomoraV1AdapterAddress: Address;
  chaiAdapterAddress: Address;
  compoundAdapterAddress: Address;
  curveExchangeAdapterAddress: Address;
  curveLiquidityAaveAdapterAddress: Address;
  curveLiquiditySethAdapterAddress: Address;
  curveLiquidityStethAdapterAddress: Address;
  idleAdapterAddress: Address;
  kyberAdapterAddress: Address;
  paraSwapAdapterAddress: Address;
  paraSwapV4AdapterAddress: Address;
  synthetixAdapterAddress: Address;
  trackedAssetsAdapterAddress: Address;
  uniswapV2AdapterAddress: Address;
  zeroExV2AdapterAddress: Address;
}

export let releaseAddressesA: ReleaseAddresses = {
  fundDeployerAddress: Address.fromString('{{releaseA.fundDeployer}}'),
  vaultLibAddress: Address.fromString('{{releaseA.vaultLib}}'),
  comptrollerLibAddress: Address.fromString('{{releaseA.comptrollerLib}}'),
  valueInterpreterAddress: Address.fromString('{{releaseA.valueInterpreter}}'),
  integrationManagerAddress: Address.fromString('{{releaseA.integrationManager}}'),
  policyManagerAddress: Address.fromString('{{releaseA.policyManager}}'),
  feeManagerAddress: Address.fromString('{{releaseA.feeManager}}'),

  // Prices
  aggregatedDerivativePriceFeedAddress: Address.fromString('{{releaseA.aggregatedDerivativePriceFeed}}'),
  chainlinkPriceFeedAddress: Address.fromString('{{releaseA.chainlinkPriceFeed}}'),

  // Derivative Price Feeds
  aavePriceFeedAddress: Address.fromString('{{releaseA.aavePriceFeed}}'),
  alphaHomoraV1PriceFeedAddress: Address.fromString('{{releaseA.alphaHomoraV1PriceFeed}}'),
  chaiPriceFeedAddress: Address.fromString('{{releaseA.chaiPriceFeed}}'),
  compoundPriceFeedAddress: Address.fromString('{{releaseA.compoundPriceFeed}}'),
  curvePriceFeedAddress: Address.fromString('{{releaseA.curvePriceFeed}}'),
  idlePriceFeedAddress: Address.fromString('{{releaseA.idlePriceFeed}}'),
  lidoStethPriceFeedAddress: Address.fromString('{{releaseA.lidoStethPriceFeed}}'),
  stakehoundEthPriceFeedAddress: Address.fromString('{{releaseA.stakehoundEthPriceFeed}}'),
  synthetixPriceFeedAddress: Address.fromString('{{releaseA.synthetixPriceFeed}}'),
  uniswapV2PoolPriceFeedAddress: Address.fromString('{{releaseA.uniswapV2PoolPriceFeed}}'),
  wdgldPriceFeedAddress: Address.fromString('{{releaseA.wdgldPriceFeed}}'),

  // Peripheral
  fundActionsWrapperAddress: Address.fromString('{{releaseA.fundActionsWrapper}}'),
  authUserExecutedSharesRequestorFactoryAddress: Address.fromString(
    '{{releaseA.authUserExecutedSharesRequestorFactory}}',
  ),

  // Fees
  managementFeeAddress: Address.fromString('{{releaseA.managementFee}}'),
  performanceFeeAddress: Address.fromString('{{releaseA.performanceFee}}'),
  entranceRateBurnFeeAddress: Address.fromString('{{releaseA.entranceRateBurnFee}}'),
  entranceRateDirectFeeAddress: Address.fromString('{{releaseA.entranceRateDirectFee}}'),

  // Policies
  adapterBlacklistAddress: Address.fromString('{{releaseA.adapterBlacklist}}'),
  adapterWhitelistAddress: Address.fromString('{{releaseA.adapterWhitelist}}'),
  assetBlacklistAddress: Address.fromString('{{releaseA.assetBlacklist}}'),
  assetWhitelistAddress: Address.fromString('{{releaseA.assetWhitelist}}'),
  investorWhitelistAddress: Address.fromString('{{releaseA.investorWhitelist}}'),
  guaranteedRedemptionAddress: Address.fromString('{{releaseA.guaranteedRedemption}}'),
  maxConcentrationAddress: Address.fromString('{{releaseA.maxConcentration}}'),
  minMaxInvestmentAddress: Address.fromString('{{releaseA.minMaxInvestment}}'),
  buySharesCallerWhitelistAddress: Address.fromString('{{releaseA.buySharesCallerWhitelist}}'),

  // Adapters
  aaveAdapterAddress: Address.fromString('{{releaseA.aaveAdapter}}'),
  alphaHomoraV1AdapterAddress: Address.fromString('{{releaseA.alphaHomoraV1Adapter}}'),
  chaiAdapterAddress: Address.fromString('{{releaseA.chaiAdapter}}'),
  compoundAdapterAddress: Address.fromString('{{releaseA.compoundAdapter}}'),
  curveExchangeAdapterAddress: Address.fromString('{{releaseA.curveExchangeAdapter}}'),
  curveLiquidityAaveAdapterAddress: Address.fromString('{{releaseA.curveLiquidityAaveAdapter}}'),
  curveLiquiditySethAdapterAddress: Address.fromString('{{releaseA.curveLiquiditySethAdapter}}'),
  curveLiquidityStethAdapterAddress: Address.fromString('{{releaseA.curveLiquidityStethAdapter}}'),
  idleAdapterAddress: Address.fromString('{{releaseA.idleAdapter}}'),
  kyberAdapterAddress: Address.fromString('{{releaseA.kyberAdapter}}'),
  paraSwapAdapterAddress: Address.fromString('{{releaseA.paraSwapAdapter}}'),
  paraSwapV4AdapterAddress: Address.fromString('{{releaseA.paraSwapV4Adapter}}'),
  synthetixAdapterAddress: Address.fromString('{{releaseA.synthetixAdapter}}'),
  trackedAssetsAdapterAddress: Address.fromString('{{releaseA.trackedAssetsAdapter}}'),
  uniswapV2AdapterAddress: Address.fromString('{{releaseA.uniswapV2Adapter}}'),
  zeroExV2AdapterAddress: Address.fromString('{{releaseA.zeroExV2Adapter}}'),
};

export let releaseAddressesB: ReleaseAddresses = {
  fundDeployerAddress: Address.fromString('{{releaseB.fundDeployer}}'),
  vaultLibAddress: Address.fromString('{{releaseB.vaultLib}}'),
  comptrollerLibAddress: Address.fromString('{{releaseB.comptrollerLib}}'),
  valueInterpreterAddress: Address.fromString('{{releaseB.valueInterpreter}}'),
  integrationManagerAddress: Address.fromString('{{releaseB.integrationManager}}'),
  policyManagerAddress: Address.fromString('{{releaseB.policyManager}}'),
  feeManagerAddress: Address.fromString('{{releaseB.feeManager}}'),

  // Prices
  aggregatedDerivativePriceFeedAddress: Address.fromString('{{releaseB.aggregatedDerivativePriceFeed}}'),
  chainlinkPriceFeedAddress: Address.fromString('{{releaseB.chainlinkPriceFeed}}'),

  // Derivative Price Feeds
  aavePriceFeedAddress: Address.fromString('{{releaseB.aavePriceFeed}}'),
  alphaHomoraV1PriceFeedAddress: Address.fromString('{{releaseB.alphaHomoraV1PriceFeed}}'),
  chaiPriceFeedAddress: Address.fromString('{{releaseB.chaiPriceFeed}}'),
  compoundPriceFeedAddress: Address.fromString('{{releaseB.compoundPriceFeed}}'),
  curvePriceFeedAddress: Address.fromString('{{releaseB.curvePriceFeed}}'),
  idlePriceFeedAddress: Address.fromString('{{releaseB.idlePriceFeed}}'),
  lidoStethPriceFeedAddress: Address.fromString('{{releaseB.lidoStethPriceFeed}}'),
  stakehoundEthPriceFeedAddress: Address.fromString('{{releaseB.stakehoundEthPriceFeed}}'),
  synthetixPriceFeedAddress: Address.fromString('{{releaseB.synthetixPriceFeed}}'),
  uniswapV2PoolPriceFeedAddress: Address.fromString('{{releaseB.uniswapV2PoolPriceFeed}}'),
  wdgldPriceFeedAddress: Address.fromString('{{releaseB.wdgldPriceFeed}}'),

  // Peripheral
  fundActionsWrapperAddress: Address.fromString('{{releaseB.fundActionsWrapper}}'),
  authUserExecutedSharesRequestorFactoryAddress: Address.fromString(
    '{{releaseB.authUserExecutedSharesRequestorFactory}}',
  ),

  // Fees
  managementFeeAddress: Address.fromString('{{releaseB.managementFee}}'),
  performanceFeeAddress: Address.fromString('{{releaseB.performanceFee}}'),
  entranceRateBurnFeeAddress: Address.fromString('{{releaseB.entranceRateBurnFee}}'),
  entranceRateDirectFeeAddress: Address.fromString('{{releaseB.entranceRateDirectFee}}'),

  // Policies
  adapterBlacklistAddress: Address.fromString('{{releaseB.adapterBlacklist}}'),
  adapterWhitelistAddress: Address.fromString('{{releaseB.adapterWhitelist}}'),
  assetBlacklistAddress: Address.fromString('{{releaseB.assetBlacklist}}'),
  assetWhitelistAddress: Address.fromString('{{releaseB.assetWhitelist}}'),
  investorWhitelistAddress: Address.fromString('{{releaseB.investorWhitelist}}'),
  guaranteedRedemptionAddress: Address.fromString('{{releaseB.guaranteedRedemption}}'),
  maxConcentrationAddress: Address.fromString('{{releaseB.maxConcentration}}'),
  minMaxInvestmentAddress: Address.fromString('{{releaseB.minMaxInvestment}}'),
  buySharesCallerWhitelistAddress: Address.fromString('{{releaseB.buySharesCallerWhitelist}}'),

  // Adapters
  aaveAdapterAddress: Address.fromString('{{releaseB.aaveAdapter}}'),
  alphaHomoraV1AdapterAddress: Address.fromString('{{releaseB.alphaHomoraV1Adapter}}'),
  chaiAdapterAddress: Address.fromString('{{releaseB.chaiAdapter}}'),
  compoundAdapterAddress: Address.fromString('{{releaseB.compoundAdapter}}'),
  curveExchangeAdapterAddress: Address.fromString('{{releaseB.curveExchangeAdapter}}'),
  curveLiquidityAaveAdapterAddress: Address.fromString('{{releaseB.curveLiquidityAaveAdapter}}'),
  curveLiquiditySethAdapterAddress: Address.fromString('{{releaseB.curveLiquiditySethAdapter}}'),
  curveLiquidityStethAdapterAddress: Address.fromString('{{releaseB.curveLiquidityStethAdapter}}'),
  idleAdapterAddress: Address.fromString('{{releaseB.idleAdapter}}'),
  kyberAdapterAddress: Address.fromString('{{releaseB.kyberAdapter}}'),
  paraSwapAdapterAddress: Address.fromString('{{releaseB.paraSwapAdapter}}'),
  paraSwapV4AdapterAddress: Address.fromString('{{releaseB.paraSwapV4Adapter}}'),
  synthetixAdapterAddress: Address.fromString('{{releaseB.synthetixAdapter}}'),
  trackedAssetsAdapterAddress: Address.fromString('{{releaseB.trackedAssetsAdapter}}'),
  uniswapV2AdapterAddress: Address.fromString('{{releaseB.uniswapV2Adapter}}'),
  zeroExV2AdapterAddress: Address.fromString('{{releaseB.zeroExV2Adapter}}'),
};

// Core
export let dispatcherAddress = Address.fromString('{{dispatcher}}');

// External
export let wethTokenAddress = Address.fromString('{{wethToken}}');
export let chaiIntegrateeAddress = Address.fromString('{{chaiIntegratee}}');
export let kyberIntegrateeAddress = Address.fromString('{{kyberIntegratee}}');
export let uniswapV2IntegrateeAddress = Address.fromString('{{uniswapV2Integratee}}');
export let synthetixIntegrateeAddress = Address.fromString('{{synthetixIntegratee}}');
export let synthetixAddressResolverAddress = Address.fromString('{{synthetixAddressResolver}}');
export let synthetixDelegateApprovalsAddress = Address.fromString('{{synthetixDelegateApprovals}}');
