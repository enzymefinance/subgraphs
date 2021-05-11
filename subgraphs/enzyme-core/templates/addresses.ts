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
  fundDeployerAddress: Address.fromString('{{releaseA.fundDeployerAddress}}'),
  vaultLibAddress: Address.fromString('{{releaseA.vaultLibAddress}}'),
  comptrollerLibAddress: Address.fromString('{{releaseA.comptrollerLibAddress}}'),
  valueInterpreterAddress: Address.fromString('{{releaseA.valueInterpreterAddress}}'),
  integrationManagerAddress: Address.fromString('{{releaseA.integrationManagerAddress}}'),
  policyManagerAddress: Address.fromString('{{releaseA.policyManagerAddress}}'),
  feeManagerAddress: Address.fromString('{{releaseA.feeManagerAddress}}'),

  // Prices
  aggregatedDerivativePriceFeedAddress: Address.fromString('{{releaseA.aggregatedDerivativePriceFeedAddress}}'),
  chainlinkPriceFeedAddress: Address.fromString('{{releaseA.chainlinkPriceFeedAddress}}'),

  // Derivative Price Feeds
  aavePriceFeedAddress: Address.fromString('{{releaseA.aavePriceFeedAddress}}'),
  alphaHomoraV1PriceFeedAddress: Address.fromString('{{releaseA.alphaHomoraV1PriceFeedAddress}}'),
  chaiPriceFeedAddress: Address.fromString('{{releaseA.chaiPriceFeedAddress}}'),
  compoundPriceFeedAddress: Address.fromString('{{releaseA.compoundPriceFeedAddress}}'),
  curvePriceFeedAddress: Address.fromString('{{releaseA.curvePriceFeedAddress}}'),
  idlePriceFeedAddress: Address.fromString('{{releaseA.idlePriceFeedAddress}}'),
  lidoStethPriceFeedAddress: Address.fromString('{{releaseA.lidoStethPriceFeedAddress}}'),
  stakehoundEthPriceFeedAddress: Address.fromString('{{releaseA.stakehoundEthPriceFeedAddress}}'),
  synthetixPriceFeedAddress: Address.fromString('{{releaseA.synthetixPriceFeedAddress}}'),
  uniswapV2PoolPriceFeedAddress: Address.fromString('{{releaseA.uniswapV2PoolPriceFeedAddress}}'),
  wdgldPriceFeedAddress: Address.fromString('{{releaseA.wdgldPriceFeedAddress}}'),

  // Peripheral
  fundActionsWrapperAddress: Address.fromString('{{releaseA.fundActionsWrapperAddress}}'),
  authUserExecutedSharesRequestorFactoryAddress: Address.fromString(
    '{{releaseA.authUserExecutedSharesRequestorFactoryAddress}}',
  ),

  // Fees
  managementFeeAddress: Address.fromString('{{releaseA.managementFeeAddress}}'),
  performanceFeeAddress: Address.fromString('{{releaseA.performanceFeeAddress}}'),
  entranceRateBurnFeeAddress: Address.fromString('{{releaseA.entranceRateBurnFeeAddress}}'),
  entranceRateDirectFeeAddress: Address.fromString('{{releaseA.entranceRateDirectFeeAddress}}'),

  // Policies
  adapterBlacklistAddress: Address.fromString('{{releaseA.adapterBlacklistAddress}}'),
  adapterWhitelistAddress: Address.fromString('{{releaseA.adapterWhitelistAddress}}'),
  assetBlacklistAddress: Address.fromString('{{releaseA.assetBlacklistAddress}}'),
  assetWhitelistAddress: Address.fromString('{{releaseA.assetWhitelistAddress}}'),
  investorWhitelistAddress: Address.fromString('{{releaseA.investorWhitelistAddress}}'),
  guaranteedRedemptionAddress: Address.fromString('{{releaseA.guaranteedRedemptionAddress}}'),
  maxConcentrationAddress: Address.fromString('{{releaseA.maxConcentrationAddress}}'),
  minMaxInvestmentAddress: Address.fromString('{{releaseA.minMaxInvestmentAddress}}'),
  buySharesCallerWhitelistAddress: Address.fromString('{{releaseA.buySharesCallerWhitelistAddress}}'),

  // Adapters
  aaveAdapterAddress: Address.fromString('{{releaseA.aaveAdapterAddress}}'),
  alphaHomoraV1AdapterAddress: Address.fromString('{{releaseA.alphaHomoraV1AdapterAddress}}'),
  chaiAdapterAddress: Address.fromString('{{releaseA.chaiAdapterAddress}}'),
  compoundAdapterAddress: Address.fromString('{{releaseA.compoundAdapterAddress}}'),
  curveExchangeAdapterAddress: Address.fromString('{{releaseA.curveExchangeAdapterAddress}}'),
  curveLiquidityAaveAdapterAddress: Address.fromString('{{releaseA.curveLiquidityAaveAdapterAddress}}'),
  curveLiquiditySethAdapterAddress: Address.fromString('{{releaseA.curveLiquiditySethAdapterAddress}}'),
  curveLiquidityStethAdapterAddress: Address.fromString('{{releaseA.curveLiquidityStethAdapterAddress}}'),
  idleAdapterAddress: Address.fromString('{{releaseA.idleAdapterAddress}}'),
  kyberAdapterAddress: Address.fromString('{{releaseA.kyberAdapterAddress}}'),
  paraSwapAdapterAddress: Address.fromString('{{releaseA.paraSwapAdapterAddress}}'),
  paraSwapV4AdapterAddress: Address.fromString('{{releaseA.paraSwapV4AdapterAddress}}'),
  synthetixAdapterAddress: Address.fromString('{{releaseA.synthetixAdapterAddress}}'),
  trackedAssetsAdapterAddress: Address.fromString('{{releaseA.trackedAssetsAdapterAddress}}'),
  uniswapV2AdapterAddress: Address.fromString('{{releaseA.uniswapV2AdapterAddress}}'),
  zeroExV2AdapterAddress: Address.fromString('{{releaseA.zeroExV2AdapterAddress}}'),
};

export let releaseAddressesB: ReleaseAddresses = {
  fundDeployerAddress: Address.fromString('{{releaseB.fundDeployerAddress}}'),
  vaultLibAddress: Address.fromString('{{releaseB.vaultLibAddress}}'),
  comptrollerLibAddress: Address.fromString('{{releaseB.comptrollerLibAddress}}'),
  valueInterpreterAddress: Address.fromString('{{releaseB.valueInterpreterAddress}}'),
  integrationManagerAddress: Address.fromString('{{releaseB.integrationManagerAddress}}'),
  policyManagerAddress: Address.fromString('{{releaseB.policyManagerAddress}}'),
  feeManagerAddress: Address.fromString('{{releaseB.feeManagerAddress}}'),

  // Prices
  aggregatedDerivativePriceFeedAddress: Address.fromString('{{releaseB.aggregatedDerivativePriceFeedAddress}}'),
  chainlinkPriceFeedAddress: Address.fromString('{{releaseB.chainlinkPriceFeedAddress}}'),

  // Derivative Price Feeds
  aavePriceFeedAddress: Address.fromString('{{releaseB.aavePriceFeedAddress}}'),
  alphaHomoraV1PriceFeedAddress: Address.fromString('{{releaseB.alphaHomoraV1PriceFeedAddress}}'),
  chaiPriceFeedAddress: Address.fromString('{{releaseB.chaiPriceFeedAddress}}'),
  compoundPriceFeedAddress: Address.fromString('{{releaseB.compoundPriceFeedAddress}}'),
  curvePriceFeedAddress: Address.fromString('{{releaseB.curvePriceFeedAddress}}'),
  idlePriceFeedAddress: Address.fromString('{{releaseB.idlePriceFeedAddress}}'),
  lidoStethPriceFeedAddress: Address.fromString('{{releaseB.lidoStethPriceFeedAddress}}'),
  stakehoundEthPriceFeedAddress: Address.fromString('{{releaseB.stakehoundEthPriceFeedAddress}}'),
  synthetixPriceFeedAddress: Address.fromString('{{releaseB.synthetixPriceFeedAddress}}'),
  uniswapV2PoolPriceFeedAddress: Address.fromString('{{releaseB.uniswapV2PoolPriceFeedAddress}}'),
  wdgldPriceFeedAddress: Address.fromString('{{releaseB.wdgldPriceFeedAddress}}'),

  // Peripheral
  fundActionsWrapperAddress: Address.fromString('{{releaseB.fundActionsWrapperAddress}}'),
  authUserExecutedSharesRequestorFactoryAddress: Address.fromString(
    '{{releaseB.authUserExecutedSharesRequestorFactoryAddress}}',
  ),

  // Fees
  managementFeeAddress: Address.fromString('{{releaseB.managementFeeAddress}}'),
  performanceFeeAddress: Address.fromString('{{releaseB.performanceFeeAddress}}'),
  entranceRateBurnFeeAddress: Address.fromString('{{releaseB.entranceRateBurnFeeAddress}}'),
  entranceRateDirectFeeAddress: Address.fromString('{{releaseB.entranceRateDirectFeeAddress}}'),

  // Policies
  adapterBlacklistAddress: Address.fromString('{{releaseB.adapterBlacklistAddress}}'),
  adapterWhitelistAddress: Address.fromString('{{releaseB.adapterWhitelistAddress}}'),
  assetBlacklistAddress: Address.fromString('{{releaseB.assetBlacklistAddress}}'),
  assetWhitelistAddress: Address.fromString('{{releaseB.assetWhitelistAddress}}'),
  investorWhitelistAddress: Address.fromString('{{releaseB.investorWhitelistAddress}}'),
  guaranteedRedemptionAddress: Address.fromString('{{releaseB.guaranteedRedemptionAddress}}'),
  maxConcentrationAddress: Address.fromString('{{releaseB.maxConcentrationAddress}}'),
  minMaxInvestmentAddress: Address.fromString('{{releaseB.minMaxInvestmentAddress}}'),
  buySharesCallerWhitelistAddress: Address.fromString('{{releaseB.buySharesCallerWhitelistAddress}}'),

  // Adapters
  aaveAdapterAddress: Address.fromString('{{releaseB.aaveAdapterAddress}}'),
  alphaHomoraV1AdapterAddress: Address.fromString('{{releaseB.alphaHomoraV1AdapterAddress}}'),
  chaiAdapterAddress: Address.fromString('{{releaseB.chaiAdapterAddress}}'),
  compoundAdapterAddress: Address.fromString('{{releaseB.compoundAdapterAddress}}'),
  curveExchangeAdapterAddress: Address.fromString('{{releaseB.curveExchangeAdapterAddress}}'),
  curveLiquidityAaveAdapterAddress: Address.fromString('{{releaseB.curveLiquidityAaveAdapterAddress}}'),
  curveLiquiditySethAdapterAddress: Address.fromString('{{releaseB.curveLiquiditySethAdapterAddress}}'),
  curveLiquidityStethAdapterAddress: Address.fromString('{{releaseB.curveLiquidityStethAdapterAddress}}'),
  idleAdapterAddress: Address.fromString('{{releaseB.idleAdapterAddress}}'),
  kyberAdapterAddress: Address.fromString('{{releaseB.kyberAdapterAddress}}'),
  paraSwapAdapterAddress: Address.fromString('{{releaseB.paraSwapAdapterAddress}}'),
  paraSwapV4AdapterAddress: Address.fromString('{{releaseB.paraSwapV4AdapterAddress}}'),
  synthetixAdapterAddress: Address.fromString('{{releaseB.synthetixAdapterAddress}}'),
  trackedAssetsAdapterAddress: Address.fromString('{{releaseB.trackedAssetsAdapterAddress}}'),
  uniswapV2AdapterAddress: Address.fromString('{{releaseB.uniswapV2AdapterAddress}}'),
  zeroExV2AdapterAddress: Address.fromString('{{releaseB.zeroExV2AdapterAddress}}'),
};

// Core
export let dispatcherAddress = Address.fromString('{{dispatcherAddress}}');

// External
export let wethTokenAddress = Address.fromString('{{wethTokenAddress}}');
export let chaiIntegrateeAddress = Address.fromString('{{chaiIntegrateeAddress}}');
export let kyberIntegrateeAddress = Address.fromString('{{kyberIntegrateeAddress}}');
export let uniswapV2IntegrateeAddress = Address.fromString('{{uniswapV2IntegrateeAddress}}');
export let synthetixIntegrateeAddress = Address.fromString('{{synthetixIntegrateeAddress}}');
export let synthetixAddressResolverAddress = Address.fromString('{{synthetixAddressResolverAddress}}');
export let synthetixDelegateApprovalsAddress = Address.fromString('{{synthetixDelegateApprovalsAddress}}');
