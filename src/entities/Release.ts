import { Release } from '../generated/schema';
import { logCritical } from '../utils/logCritical';
import { CurrentFundDeployerSet } from '../generated/DispatcherContract';

export function useRelease(id: string): Release {
  let release = Release.load(id);
  if (release == null) {
    logCritical('Failed to load release {}.', [id]);
  }

  return release as Release;
}

export function createRelease(event: CurrentFundDeployerSet): Release {
  let id = event.params.vaultProxy.toHex();

  let release = new Release(id);

  release.inception = event.block.timestamp;
  release.deployer = ensureFundDeployer(event.address).id;
  release.accessor = ensureComptroller(event.params.comptrollerProxy).id;
  release.manager = ensureManager(event.params.releaseOwner, event).id;
  release.creator = ensureAccount(event.params.caller, event).id;
  release.trackedAssets = [];
  release.denominationAsset = ensureAsset(event.params.denominationAsset).id;
  release.policies = [];
  release.save();

  return release;
}
