import { Release } from '../generated/schema';
import { logCritical } from '../utils/logCritical';
import { CurrentFundDeployerSet } from '../generated/DispatcherContract';
import { ensureFundDeployer } from '../entities/FundDeployer';
import { ensureVaultLib } from '../entities/VaultLib';

export function useRelease(id: string): Release {
  let release = Release.load(id);
  if (release == null) {
    logCritical('Failed to load release {}.', [id]);
  }

  return release as Release;
}

export function createRelease(event: CurrentFundDeployerSet): Release {
  let fundDeployer = ensureFundDeployer(event.params.nextFundDeployer);
  let release = new Release(fundDeployer.id);

  release.fundDeployer = fundDeployer.id;
  release.current = true;
  release.currentStart = event.block.timestamp;
  release.save();

  return release;
}
