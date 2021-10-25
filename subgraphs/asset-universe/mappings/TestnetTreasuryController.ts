import { ZERO_ADDRESS } from '@enzymefinance/subgraph-utils';
import { getOrCreateAsset } from '../entities/Asset';
import { createPrimitiveRegistration } from '../entities/Registration';
import { getOrCreateVersion } from '../entities/Version';
import { releaseV4Address, wethTokenAddress } from '../generated/configuration';
import { TokenDeployed } from '../generated/contracts/TestnetTreasuryControllerEvents';

export function handleTokenDeployed(event: TokenDeployed): void {
  let version = getOrCreateVersion(releaseV4Address);

  let asset = getOrCreateAsset(event.params.asset);

  createPrimitiveRegistration(version, asset, ZERO_ADDRESS, event);

  // WETH
  let weth = getOrCreateAsset(wethTokenAddress);
  createPrimitiveRegistration(version, weth, ZERO_ADDRESS, event);
}
