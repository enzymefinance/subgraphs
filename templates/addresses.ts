import { Address } from '@graphprotocol/graph-ts';

// NOTE: We consider addresses for a release to be immutable. Hence, we
// can statically define these in the code and don't need to spawn dynamic
// data sources for these. One place where this would be tempting for instance
// is the ComptrollerLibSet event. However, since all the addresses defined
// there are constant values both by convention but also simply through the
// way we deploy our protocol, we can use these addresses here.
export let chaiPriceSource = Address.fromString('{{chaiPriceSource}}');
export let chaiIntegratee = Address.fromString('{{chaiIntegratee}}');
export let kyberIntegratee = Address.fromString('{{kyberIntegratee}}');
export let dispatcher = Address.fromString('{{dispatcher}}');
export let vaultLib = Address.fromString('{{vaultLib}}');
export let fundDeployer = Address.fromString('{{fundDeployer}}');
export let valueInterpreter = Address.fromString('{{valueInterpreter}}');
export let engine = Address.fromString('{{engine}}');
export let comptrollerLib = Address.fromString('{{comptrollerLib}}');
export let feeManager = Address.fromString('{{feeManager}}');
export let integrationManager = Address.fromString('{{integrationManager}}');
export let policyManager = Address.fromString('{{policyManager}}');
export let chainlinkPriceFeed = Address.fromString('{{chainlinkPriceFeed}}');
export let chaiPriceFeed = Address.fromString('{{chaiPriceFeed}}');
export let aggregatedDerivativePriceFeed = Address.fromString('{{aggregatedDerivativePriceFeed}}');
export let chaiAdapter = Address.fromString('{{chaiAdapter}}');
export let kyberAdapter = Address.fromString('{{kyberAdapter}}');
export let managementFee = Address.fromString('{{managementFee}}');
export let performanceFee = Address.fromString('{{performanceFee}}');
export let adapterBlacklist = Address.fromString('{{adapterBlacklist}}');
export let adapterWhitelist = Address.fromString('{{adapterWhitelist}}');
export let assetBlacklist = Address.fromString('{{assetBlacklist}}');
export let assetWhitelist = Address.fromString('{{assetWhitelist}}');
export let maxConcentration = Address.fromString('{{maxConcentration}}');
export let investorWhitelist = Address.fromString('{{investorWhitelist}}');
