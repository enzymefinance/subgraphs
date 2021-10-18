import { ZERO_ADDRESS } from '@enzymefinance/subgraph-utils';
import { getOrCreateAsset } from '../entities/Asset';
import { getOrCreateVersion } from '../entities/Version';
import { TokenDeployed } from '../generated/contracts/TestnetTreasuryControllerEvents';

export function handleTokenDeployed(event: TokenDeployed): void {
  // TODO: Actually support versions? Would need testnet contract change.
  let version = getOrCreateVersion(ZERO_ADDRESS);
  getOrCreateAsset(event.params.asset, version);
}
