import { Release } from '../generated/schema';
import { logCritical } from '../utils/logCritical';
import { CurrentFundDeployerSet } from '../generated/DispatcherContract';

export function useRelease(id: string): Release {
  let release = Release.load(id) as Release;
  if (release == null) {
    logCritical('Failed to load release {}.', [id]);
  }

  return release;
}

export function createRelease(event: CurrentFundDeployerSet): Release {
  let release = new Release(event.params.nextFundDeployer.toHex());
  release.current = true;
  release.open = event.block.timestamp;
  release.save();

  return release;
}
