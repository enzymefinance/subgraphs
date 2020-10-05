import { Address } from '@graphprotocol/graph-ts';

// NOTE: We consider addresses for a release to be immutable. Hence, we
// can statically define these in the code and don't need to spawn dynamic
// data sources for these. One place where this would be tempting for instance
// is the ComptrollerLibSet event. However, since all the addresses defined
// there are constant values both by convention but also simply through the
// way we deploy our protocol, we can use these addresses here.
export let wethTokenAddress = Address.fromString('{{wethToken}}');
export let chaiPriceSourceAddress = Address.fromString('{{chaiPriceSource}}');
export let chaiIntegrateeAddress = Address.fromString('{{chaiIntegratee}}');
export let kyberIntegrateeAddress = Address.fromString('{{kyberIntegratee}}');
export let dispatcherAddress = Address.fromString('{{dispatcher}}');
export let vaultLibAddress = Address.fromString('{{vaultLib}}');
export let fundDeployerAddress = Address.fromString('{{fundDeployer}}');
export let valueInterpreterAddress = Address.fromString('{{valueInterpreter}}');
export let engineAddress = Address.fromString('{{engine}}');
export let comptrollerLibAddress = Address.fromString('{{comptrollerLib}}');
export let feeManagerAddress = Address.fromString('{{feeManager}}');
export let integrationManagerAddress = Address.fromString('{{integrationManager}}');
export let policyManagerAddress = Address.fromString('{{policyManager}}');
export let chainlinkPriceFeedAddress = Address.fromString('{{chainlinkPriceFeed}}');
export let chaiPriceFeedAddress = Address.fromString('{{chaiPriceFeed}}');
export let aggregatedDerivativePriceFeedAddress = Address.fromString('{{aggregatedDerivativePriceFeed}}');
export let chaiAdapterAddress = Address.fromString('{{chaiAdapter}}');
export let kyberAdapterAddress = Address.fromString('{{kyberAdapter}}');
export let managementFeeAddress = Address.fromString('{{managementFee}}');
export let performanceFeeAddress = Address.fromString('{{performanceFee}}');
export let adapterBlacklistAddress = Address.fromString('{{adapterBlacklist}}');
export let adapterWhitelistAddress = Address.fromString('{{adapterWhitelist}}');
export let assetBlacklistAddress = Address.fromString('{{assetBlacklist}}');
export let assetWhitelistAddress = Address.fromString('{{assetWhitelist}}');
export let maxConcentrationAddress = Address.fromString('{{maxConcentration}}');
export let investorWhitelistAddress = Address.fromString('{{investorWhitelist}}');
