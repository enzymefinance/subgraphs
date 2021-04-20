import { Address } from '@graphprotocol/graph-ts';

// NOTE: We consider addresses for a release to be immutable. Hence, we
// can statically define these in the code and don't need to spawn dynamic
// data sources for these. One place where this would be tempting for instance
// is the ComptrollerLibSet event. However, since all the addresses defined
// there are constant values both by convention but also simply through the
// way we deploy our protocol, we can use these addresses here.

// Core
export let dispatcherAddress = Address.fromString('{{dispatcher}}');
export let fundDeployerAddress = Address.fromString('{{fundDeployer}}');
export let vaultLibAddress = Address.fromString('{{vaultLib}}');
export let comptrollerLibAddress = Address.fromString('{{comptrollerLib}}');
export let valueInterpreterAddress = Address.fromString('{{valueInterpreter}}');
export let integrationManagerAddress = Address.fromString('{{integrationManager}}');
export let policyManagerAddress = Address.fromString('{{policyManager}}');
export let feeManagerAddress = Address.fromString('{{feeManager}}');

// Prices
export let aggregatedDerivativePriceFeedAddress = Address.fromString('{{aggregatedDerivativePriceFeed}}');
export let chainlinkPriceFeedAddress = Address.fromString('{{chainlinkPriceFeed}}');

// Derivative Price Feeds
export let aavePriceFeed = Address.fromString('{{aavePriceFeed}}');
export let alphaHomoraV1PriceFeed = Address.fromString('{{alphaHomoraV1PriceFeed}}');
export let chaiPriceFeed = Address.fromString('{{chaiPriceFeed}}');
export let compoundPriceFeed = Address.fromString('{{compoundPriceFeed}}');
export let curvePriceFeed = Address.fromString('{{curvePriceFeed}}');
export let idlePriceFeed = Address.fromString('{{idlePriceFeed}}');
export let lidoStethPriceFeed = Address.fromString('{{lidoStethPriceFeed}}');
export let stakehoundEthPriceFeed = Address.fromString('{{stakehoundEthPriceFeed}}');
export let synthetixPriceFeed = Address.fromString('{{synthetixPriceFeed}}');
export let uniswapV2PoolPriceFeed = Address.fromString('{{uniswapV2PoolPriceFeed}}');
export let wdgldPriceFeed = Address.fromString('{{wdgldPriceFeed}}');

// Peripheral
export let fundActionsWrapperAddress = Address.fromString('{{fundActionsWrapper}}');
export let authUserExecutedSharesRequestorFactoryAddress = Address.fromString(
  '{{authUserExecutedSharesRequestorFactory}}',
);

// Fees
export let managementFeeAddress = Address.fromString('{{managementFee}}');
export let performanceFeeAddress = Address.fromString('{{performanceFee}}');
export let entranceRateBurnFeeAddress = Address.fromString('{{entranceRateBurnFee}}');
export let entranceRateDirectFeeAddress = Address.fromString('{{entranceRateDirectFee}}');

// Policies
export let adapterBlacklistAddress = Address.fromString('{{adapterBlacklist}}');
export let adapterWhitelistAddress = Address.fromString('{{adapterWhitelist}}');
export let assetBlacklistAddress = Address.fromString('{{assetBlacklist}}');
export let assetWhitelistAddress = Address.fromString('{{assetWhitelist}}');
export let investorWhitelistAddress = Address.fromString('{{investorWhitelist}}');
export let guaranteedRedemptionAddress = Address.fromString('{{guaranteedRedemption}}');
export let maxConcentrationAddress = Address.fromString('{{maxConcentration}}');
export let minMaxInvestmentAddress = Address.fromString('{{minMaxInvestment}}');
export let buySharesCallerWhitelistAddress = Address.fromString('{{buySharesCallerWhitelist}}');

// Adapters
export let aaveAdapterAddress = Address.fromString('{{aaveAdapter}}');
export let alphaHomoraV1AdapterAddress = Address.fromString('{{alphaHomoraV1Adapter}}');
export let chaiAdapterAddress = Address.fromString('{{chaiAdapter}}');
export let compoundAdapterAddress = Address.fromString('{{compoundAdapter}}');
export let curveExchangeAdapterAddress = Address.fromString('{{curveExchangeAdapter}}');
export let curveLiquidityAaveAdapterAddress = Address.fromString('{{curveLiquidityAaveAdapter}}');
export let curveLiquiditySethAdapterAddress = Address.fromString('{{curveLiquiditySethAdapter}}');
export let curveLiquidityStethAdapterAddress = Address.fromString('{{curveLiquidityStethAdapter}}');
export let idleAdapterAddress = Address.fromString('{{idleAdapter}}');
export let kyberAdapterAddress = Address.fromString('{{kyberAdapter}}');
export let paraSwapAdapterAddress = Address.fromString('{{paraSwapAdapter}}');
export let synthetixAdapterAddress = Address.fromString('{{synthetixAdapter}}');
export let trackedAssetsAdapterAddress = Address.fromString('{{trackedAssetsAdapter}}');
export let uniswapV2AdapterAddress = Address.fromString('{{uniswapV2Adapter}}');
export let zeroExV2AdapterAddress = Address.fromString('{{zeroExV2Adapter}}');

// External
export let wethTokenAddress = Address.fromString('{{wethToken}}');
export let chaiIntegrateeAddress = Address.fromString('{{chaiIntegratee}}');
export let kyberIntegrateeAddress = Address.fromString('{{kyberIntegratee}}');
export let uniswapV2IntegrateeAddress = Address.fromString('{{uniswapV2Integratee}}');
export let synthetixIntegrateeAddress = Address.fromString('{{synthetixIntegratee}}');
export let synthetixAddressResolverAddress = Address.fromString('{{synthetixAddressResolver}}');
export let synthetixDelegateApprovalsAddress = Address.fromString('{{synthetixDelegateApprovals}}');

// Currencies
export let audChainlinkAggregator = Address.fromString('{{audChainlinkAggregator}}');
export let btcChainlinkAggregator = Address.fromString('{{btcChainlinkAggregator}}');
export let chfChainlinkAggregator = Address.fromString('{{chfChainlinkAggregator}}');
export let eurChainlinkAggregator = Address.fromString('{{eurChainlinkAggregator}}');
export let gbpChainlinkAggregator = Address.fromString('{{gbpChainlinkAggregator}}');
export let jpyChainlinkAggregator = Address.fromString('{{jpyChainlinkAggregator}}');
