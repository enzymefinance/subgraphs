import { Release } from '../generated/schema';
import { logCritical } from '../utils/logCritical';
import { CurrentFundDeployerSet } from '../generated/DispatcherContract';
import { FundDeployerContract } from '../generated/FundDeployerContract';
import { ensureFundDeployer } from '../entities/FundDeployer';
import { ensureVaultLib } from '../entities/VaultLib';
import { ensureComptrollerLib } from '../entities/ComptrollerLib';
import { ensureDispatcher } from '../entities/Dispatcher';

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

  // Bind the new FundDeployer smart contract
  // Not sure if that would work given that the next FundDeployer contract would be different from this interface below?
  let fundDeployerContract = FundDeployerContract.bind(event.params.nextFundDeployer);

  // Retrieve new VaultLib
  release.vaultLib = ensureVaultLib(fundDeployerContract.getVaultLib()).id;
  // Retrieve new ComptrollerLib.
  // Field is mandatory, so must be set in FundDeployer before the release is created (i.e. before setCurrentFundDeployer is called on the Dispatcher contract)
  release.comptrollerLib = ensureComptrollerLib(fundDeployerContract.getComptrollerLib()).id;

  // Retrieve Dispatcher
  release.dispatcher = ensureDispatcher(fundDeployerContract.getDispatcher()).id;

  //TODO: Retrieve & Assign other modules?

  release.save();
  return release;
}
