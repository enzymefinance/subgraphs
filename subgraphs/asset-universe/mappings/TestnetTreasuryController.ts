import { ZERO_ADDRESS } from '@enzymefinance/subgraph-utils';
import { getOrCreateAsset } from '../entities/Asset';
import { createPrimitiveRegistration } from '../entities/Registration';
import { getOrCreateRelease } from '../entities/Release';
import { releaseV4Address, wethTokenAddress } from '../generated/configuration';
import { TokenDeployed } from '../generated/contracts/TestnetTreasuryControllerEvents';

export function handleTokenDeployed(event: TokenDeployed): void {
  let release = getOrCreateRelease(releaseV4Address);

  let asset = getOrCreateAsset(event.params.asset);

  createPrimitiveRegistration(release, asset, event);

  // WETH
  let weth = getOrCreateAsset(wethTokenAddress);
  createPrimitiveRegistration(release, weth, event);
}
