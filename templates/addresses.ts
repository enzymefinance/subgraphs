import { Address } from '@graphprotocol/graph-ts';

// NOTE: We consider addresses for a release to be immutable. Hence, we
// can statically define these in the code and don't need to spawn dynamic
// data sources for these. One place where this would be tempting for instance
// is the ComptrollerLibSet event. However, since all the addresses defined
// there are constant values both by convention but also simply through the
// way we deploy our protocol, we can use these addresses here.
export let adapterBlacklistAddress = Address.fromString('{{adapterBlacklist}}');
export let adapterWhitelistAddress = Address.fromString('{{adapterWhitelist}}');
export let aggregatedDerivativePriceFeedAddress = Address.fromString('{{aggregatedDerivativePriceFeed}}');
export let assetBlacklistAddress = Address.fromString('{{assetBlacklist}}');
export let assetWhitelistAddress = Address.fromString('{{assetWhitelist}}');
export let buySharesCallerWhitelistAddress = Address.fromString('{{buySharesCallerWhitelist}}');
export let chainlinkPriceFeedAddress = Address.fromString('{{chainlinkPriceFeed}}');
export let comptrollerLibAddress = Address.fromString('{{comptrollerLib}}');
export let dispatcherAddress = Address.fromString('{{dispatcher}}');
export let feeManagerAddress = Address.fromString('{{feeManager}}');
export let fundActionsWrapperAddress = Address.fromString('{{fundActionsWrapper}}');
export let fundDeployerAddress = Address.fromString('{{fundDeployer}}');
export let guaranteedRedemptionAddress = Address.fromString('{{guaranteedRedemption}}');
export let integrationManagerAddress = Address.fromString('{{integrationManager}}');
export let investorWhitelistAddress = Address.fromString('{{investorWhitelist}}');
export let managementFeeAddress = Address.fromString('{{managementFee}}');
export let maxConcentrationAddress = Address.fromString('{{maxConcentration}}');
export let performanceFeeAddress = Address.fromString('{{performanceFee}}');
export let policyManagerAddress = Address.fromString('{{policyManager}}');
export let valueInterpreterAddress = Address.fromString('{{valueInterpreter}}');
export let vaultLibAddress = Address.fromString('{{vaultLib}}');
export let wethTokenAddress = Address.fromString('{{wethToken}}');

export let audChainlinkAggregator = Address.fromString('{{audChainlinkAggregator}}');
export let btcChainlinkAggregator = Address.fromString('{{btcChainlinkAggregator}}');
export let chfChainlinkAggregator = Address.fromString('{{chfChainlinkAggregator}}');
export let eurChainlinkAggregator = Address.fromString('{{eurChainlinkAggregator}}');
export let gbpChainlinkAggregator = Address.fromString('{{gbpChainlinkAggregator}}');
export let jpyChainlinkAggregator = Address.fromString('{{jpyChainlinkAggregator}}');
