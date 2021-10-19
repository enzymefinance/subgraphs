import { getOrCreateAsset } from '../entities/Asset';
import { TokenDeployed } from '../generated/contracts/TestnetTreasuryControllerEvents';

export function handleTokenDeployed(event: TokenDeployed): void {
  getOrCreateAsset(event.params.asset);
}
