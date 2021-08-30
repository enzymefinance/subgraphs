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
  yearnVaultV2PriceFeedAddress: Address;
  fundActionsWrapperAddress: Address;
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
  curveLiquidityEursAdapterAddress: Address;
  curveLiquiditySethAdapterAddress: Address;
  curveLiquidityStethAdapterAddress: Address;
  idleAdapterAddress: Address;
  kyberAdapterAddress: Address;
  paraSwapAdapterAddress: Address;
  paraSwapV4AdapterAddress: Address;
  synthetixAdapterAddress: Address;
  trackedAssetsAdapterAddress: Address;
  uniswapV2AdapterAddress: Address;
  yearnVaultV2AdapterAddress: Address;
  zeroExV2AdapterAddress: Address;
}

export let releaseAddressesA: ReleaseAddresses = {
  fundDeployerAddress: Address.fromString('{{releases.0.fundDeployer}}'),
  vaultLibAddress: Address.fromString('{{releases.0.vaultLib}}'),
  comptrollerLibAddress: Address.fromString('{{releases.0.comptrollerLib}}'),
  valueInterpreterAddress: Address.fromString('{{releases.0.valueInterpreter}}'),
  integrationManagerAddress: Address.fromString('{{releases.0.integrationManager}}'),
  policyManagerAddress: Address.fromString('{{releases.0.policyManager}}'),
  feeManagerAddress: Address.fromString('{{releases.0.feeManager}}'),

  // Prices
  aggregatedDerivativePriceFeedAddress: Address.fromString('{{releases.0.aggregatedDerivativePriceFeed}}'),
  chainlinkPriceFeedAddress: Address.fromString('{{releases.0.chainlinkPriceFeed}}'),

  // Derivative Price Feeds
  aavePriceFeedAddress: Address.fromString('{{releases.0.aavePriceFeed}}'),
  alphaHomoraV1PriceFeedAddress: Address.fromString('{{releases.0.alphaHomoraV1PriceFeed}}'),
  chaiPriceFeedAddress: Address.fromString('{{releases.0.chaiPriceFeed}}'),
  compoundPriceFeedAddress: Address.fromString('{{releases.0.compoundPriceFeed}}'),
  curvePriceFeedAddress: Address.fromString('{{releases.0.curvePriceFeed}}'),
  idlePriceFeedAddress: Address.fromString('{{releases.0.idlePriceFeed}}'),
  lidoStethPriceFeedAddress: Address.fromString('{{releases.0.lidoStethPriceFeed}}'),
  stakehoundEthPriceFeedAddress: Address.fromString('{{releases.0.stakehoundEthPriceFeed}}'),
  synthetixPriceFeedAddress: Address.fromString('{{releases.0.synthetixPriceFeed}}'),
  uniswapV2PoolPriceFeedAddress: Address.fromString('{{releases.0.uniswapV2PoolPriceFeed}}'),
  wdgldPriceFeedAddress: Address.fromString('{{releases.0.wdgldPriceFeed}}'),
  yearnVaultV2PriceFeedAddress: Address.fromString('{{releases.0.yearnVaultV2PriceFeed}}'),

  // Peripheral
  fundActionsWrapperAddress: Address.fromString('{{releases.0.fundActionsWrapper}}'),

  // Fees
  managementFeeAddress: Address.fromString('{{releases.0.managementFee}}'),
  performanceFeeAddress: Address.fromString('{{releases.0.performanceFee}}'),
  entranceRateBurnFeeAddress: Address.fromString('{{releases.0.entranceRateBurnFee}}'),
  entranceRateDirectFeeAddress: Address.fromString('{{releases.0.entranceRateDirectFee}}'),

  // Policies
  adapterBlacklistAddress: Address.fromString('{{releases.0.adapterBlacklist}}'),
  adapterWhitelistAddress: Address.fromString('{{releases.0.adapterWhitelist}}'),
  assetBlacklistAddress: Address.fromString('{{releases.0.assetBlacklist}}'),
  assetWhitelistAddress: Address.fromString('{{releases.0.assetWhitelist}}'),
  investorWhitelistAddress: Address.fromString('{{releases.0.investorWhitelist}}'),
  guaranteedRedemptionAddress: Address.fromString('{{releases.0.guaranteedRedemption}}'),
  maxConcentrationAddress: Address.fromString('{{releases.0.maxConcentration}}'),
  minMaxInvestmentAddress: Address.fromString('{{releases.0.minMaxInvestment}}'),
  buySharesCallerWhitelistAddress: Address.fromString('{{releases.0.buySharesCallerWhitelist}}'),

  // Adapters
  aaveAdapterAddress: Address.fromString('{{releases.0.aaveAdapter}}'),
  alphaHomoraV1AdapterAddress: Address.fromString('{{releases.0.alphaHomoraV1Adapter}}'),
  chaiAdapterAddress: Address.fromString('{{releases.0.chaiAdapter}}'),
  compoundAdapterAddress: Address.fromString('{{releases.0.compoundAdapter}}'),
  curveExchangeAdapterAddress: Address.fromString('{{releases.0.curveExchangeAdapter}}'),
  curveLiquidityAaveAdapterAddress: Address.fromString('{{releases.0.curveLiquidityAaveAdapter}}'),
  curveLiquidityEursAdapterAddress: Address.fromString('{{releases.0.curveLiquidityEursAdapter}}'),
  curveLiquiditySethAdapterAddress: Address.fromString('{{releases.0.curveLiquiditySethAdapter}}'),
  curveLiquidityStethAdapterAddress: Address.fromString('{{releases.0.curveLiquidityStethAdapter}}'),
  idleAdapterAddress: Address.fromString('{{releases.0.idleAdapter}}'),
  kyberAdapterAddress: Address.fromString('{{releases.0.kyberAdapter}}'),
  paraSwapAdapterAddress: Address.fromString('{{releases.0.paraSwapAdapter}}'),
  paraSwapV4AdapterAddress: Address.fromString('{{releases.0.paraSwapV4Adapter}}'),
  synthetixAdapterAddress: Address.fromString('{{releases.0.synthetixAdapter}}'),
  trackedAssetsAdapterAddress: Address.fromString('{{releases.0.trackedAssetsAdapter}}'),
  uniswapV2AdapterAddress: Address.fromString('{{releases.0.uniswapV2Adapter}}'),
  yearnVaultV2AdapterAddress: Address.fromString('{{releases.0.yearnVaultV2Adapter}}'),
  zeroExV2AdapterAddress: Address.fromString('{{releases.0.zeroExV2Adapter}}'),
};

export let releaseAddressesB: ReleaseAddresses = {
  fundDeployerAddress: Address.fromString('{{releases.1.fundDeployer}}'),
  vaultLibAddress: Address.fromString('{{releases.1.vaultLib}}'),
  comptrollerLibAddress: Address.fromString('{{releases.1.comptrollerLib}}'),
  valueInterpreterAddress: Address.fromString('{{releases.1.valueInterpreter}}'),
  integrationManagerAddress: Address.fromString('{{releases.1.integrationManager}}'),
  policyManagerAddress: Address.fromString('{{releases.1.policyManager}}'),
  feeManagerAddress: Address.fromString('{{releases.1.feeManager}}'),

  // Prices
  aggregatedDerivativePriceFeedAddress: Address.fromString('{{releases.1.aggregatedDerivativePriceFeed}}'),
  chainlinkPriceFeedAddress: Address.fromString('{{releases.1.chainlinkPriceFeed}}'),

  // Derivative Price Feeds
  aavePriceFeedAddress: Address.fromString('{{releases.1.aavePriceFeed}}'),
  alphaHomoraV1PriceFeedAddress: Address.fromString('{{releases.1.alphaHomoraV1PriceFeed}}'),
  chaiPriceFeedAddress: Address.fromString('{{releases.1.chaiPriceFeed}}'),
  compoundPriceFeedAddress: Address.fromString('{{releases.1.compoundPriceFeed}}'),
  curvePriceFeedAddress: Address.fromString('{{releases.1.curvePriceFeed}}'),
  idlePriceFeedAddress: Address.fromString('{{releases.1.idlePriceFeed}}'),
  lidoStethPriceFeedAddress: Address.fromString('{{releases.1.lidoStethPriceFeed}}'),
  stakehoundEthPriceFeedAddress: Address.fromString('{{releases.1.stakehoundEthPriceFeed}}'),
  synthetixPriceFeedAddress: Address.fromString('{{releases.1.synthetixPriceFeed}}'),
  uniswapV2PoolPriceFeedAddress: Address.fromString('{{releases.1.uniswapV2PoolPriceFeed}}'),
  wdgldPriceFeedAddress: Address.fromString('{{releases.1.wdgldPriceFeed}}'),
  yearnVaultV2PriceFeedAddress: Address.fromString('{{releases.1.yearnVaultV2PriceFeed}}'),

  // Peripheral
  fundActionsWrapperAddress: Address.fromString('{{releases.1.fundActionsWrapper}}'),

  // Fees
  managementFeeAddress: Address.fromString('{{releases.1.managementFee}}'),
  performanceFeeAddress: Address.fromString('{{releases.1.performanceFee}}'),
  entranceRateBurnFeeAddress: Address.fromString('{{releases.1.entranceRateBurnFee}}'),
  entranceRateDirectFeeAddress: Address.fromString('{{releases.1.entranceRateDirectFee}}'),

  // Policies
  adapterBlacklistAddress: Address.fromString('{{releases.1.adapterBlacklist}}'),
  adapterWhitelistAddress: Address.fromString('{{releases.1.adapterWhitelist}}'),
  assetBlacklistAddress: Address.fromString('{{releases.1.assetBlacklist}}'),
  assetWhitelistAddress: Address.fromString('{{releases.1.assetWhitelist}}'),
  investorWhitelistAddress: Address.fromString('{{releases.1.investorWhitelist}}'),
  guaranteedRedemptionAddress: Address.fromString('{{releases.1.guaranteedRedemption}}'),
  maxConcentrationAddress: Address.fromString('{{releases.1.maxConcentration}}'),
  minMaxInvestmentAddress: Address.fromString('{{releases.1.minMaxInvestment}}'),
  buySharesCallerWhitelistAddress: Address.fromString('{{releases.1.buySharesCallerWhitelist}}'),

  // Adapters
  aaveAdapterAddress: Address.fromString('{{releases.1.aaveAdapter}}'),
  alphaHomoraV1AdapterAddress: Address.fromString('{{releases.1.alphaHomoraV1Adapter}}'),
  chaiAdapterAddress: Address.fromString('{{releases.1.chaiAdapter}}'),
  compoundAdapterAddress: Address.fromString('{{releases.1.compoundAdapter}}'),
  curveExchangeAdapterAddress: Address.fromString('{{releases.1.curveExchangeAdapter}}'),
  curveLiquidityAaveAdapterAddress: Address.fromString('{{releases.1.curveLiquidityAaveAdapter}}'),
  curveLiquidityEursAdapterAddress: Address.fromString('{{releases.1.curveLiquidityEursAdapter}}'),
  curveLiquiditySethAdapterAddress: Address.fromString('{{releases.1.curveLiquiditySethAdapter}}'),
  curveLiquidityStethAdapterAddress: Address.fromString('{{releases.1.curveLiquidityStethAdapter}}'),
  idleAdapterAddress: Address.fromString('{{releases.1.idleAdapter}}'),
  kyberAdapterAddress: Address.fromString('{{releases.1.kyberAdapter}}'),
  paraSwapAdapterAddress: Address.fromString('{{releases.1.paraSwapAdapter}}'),
  paraSwapV4AdapterAddress: Address.fromString('{{releases.1.paraSwapV4Adapter}}'),
  synthetixAdapterAddress: Address.fromString('{{releases.1.synthetixAdapter}}'),
  trackedAssetsAdapterAddress: Address.fromString('{{releases.1.trackedAssetsAdapter}}'),
  uniswapV2AdapterAddress: Address.fromString('{{releases.1.uniswapV2Adapter}}'),
  yearnVaultV2AdapterAddress: Address.fromString('{{releases.1.yearnVaultV2Adapter}}'),
  zeroExV2AdapterAddress: Address.fromString('{{releases.1.zeroExV2Adapter}}'),
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

// Currencies
export let audChainlinkAggregatorAddress = Address.fromString('{{audChainlinkAggregator}}');
export let btcChainlinkAggregatorAddress = Address.fromString('{{btcChainlinkAggregator}}');
export let chfChainlinkAggregatorAddress = Address.fromString('{{chfChainlinkAggregator}}');
export let eurChainlinkAggregatorAddress = Address.fromString('{{eurChainlinkAggregator}}');
export let gbpChainlinkAggregatorAddress = Address.fromString('{{gbpChainlinkAggregator}}');
export let jpyChainlinkAggregatorAddress = Address.fromString('{{jpyChainlinkAggregator}}');
