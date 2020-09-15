import { Release } from '../generated/schema';
import { logCritical } from '../utils/logCritical';
import { CurrentFundDeployerSet } from '../generated/DispatcherContract';
import { ensureFundDeployer } from '../entities/FundDeployer';
import { ensureContract } from '../entities/Contract';

export function useRelease(id: string): Release {
  let release = Release.load(id);
  if (release == null) {
    logCritical('Failed to load release {}.', [id]);
  }

  return release as Release;
}

export function createRelease(event: CurrentFundDeployerSet): Release {
  let id = event.params.nextFundDeployer.toHex();
  let release = new Release(id);

  release.deployer = ensureFundDeployer(event.params.nextFundDeployer).id;
  release.current = true;
  release.currentStart = event.block.timestamp;
  release.vaultLib = ensureContract(event.params.nextVaultLib, 'VaultLib').id;

  /*   release.accessor = ensureComptroller(event.params.comptrollerProxy).id;
  release.creator = ensureAccount(event.params.caller, event).id;
  release.trackedAssets = [];
  release.denominationAsset = ensureAsset(event.params.denominationAsset).id;
  release.policies = []; */
  release.save();

  return release;
}
