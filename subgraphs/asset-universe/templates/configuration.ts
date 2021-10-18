import { Address } from '@graphprotocol/graph-ts';

export let releaseV2Address = Address.fromString('{{or releaseConfiguration.v2.fundDeployer "0x0000000000000000000000000000000000000000"}}');
export let releaseV3Address = Address.fromString('{{or releaseConfiguration.v3.fundDeployer "0x0000000000000000000000000000000000000000"}}');
export let releaseV4Address = Address.fromString('{{or releaseConfiguration.v4.fundDeployer "0x0000000000000000000000000000000000000000"}}');

export let testnetTreasuryControllerAddress = Address.fromString('{{or testnetConfiguration.treasuryController "0x0000000000000000000000000000000000000000"}}');
