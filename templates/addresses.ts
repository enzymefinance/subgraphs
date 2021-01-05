import { Address } from '@graphprotocol/graph-ts';

// NOTE: We consider addresses for a release to be immutable. Hence, we
// can statically define these in the code and don't need to spawn dynamic
// data sources for these. One place where this would be tempting for instance
// is the ComptrollerLibSet event. However, since all the addresses defined
// there are constant values both by convention but also simply through the
// way we deploy our protocol, we can use these addresses here.
export let wethTokenAddress = Address.fromString('{{wethToken}}');
export let valueInterpreterAddress = Address.fromString('{{valueInterpreter}}');
export let fundActionsWrapperAddress = Address.fromString('{{fundActionsWrapper}}');

export let eurChainlinkAggregator = Address.fromString('{{eurChainlinkAggregator}}');
export let chfChainlinkAggregator = Address.fromString('{{chfChainlinkAggregator}}');
export let jpyChainlinkAggregator = Address.fromString('{{jpyChainlinkAggregator}}');
