import { Release } from '../generated/schema';
import { logCritical } from '../utils/logCritical';
import { CurrentFundDeployerSet } from '../generated/DispatcherContract';
import { FundDeployerContract } from '../generated/FundDeployerContract';
import { ensureFundDeployer } from '../entities/FundDeployer';
import { ensureVaultLib } from '../entities/VaultLib';
import { ensureComptrollerLib } from '../entities/ComptrollerLib';
import { ensureDispatcher } from '../entities/Dispatcher';
import { ensurePriceFeed } from '../entities/PriceFeed';
import { ComptrollerLibContract } from '../generated/ComptrollerLibContract';

export function useRelease(id: string): Release {
  let release = Release.load(id) as Release;
  if (release == null) {
    logCritical('Failed to load release {}.', [id]);
  }

  return release;
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
  // Field is mandatory, so must have already been set in FundDeployer before the release is created
  let comptrollerLib = fundDeployerContract.getComptrollerLib();
  release.comptrollerLib = ensureComptrollerLib(comptrollerLib).id;

  // Retrieve Dispatcher
  let dispatcher = fundDeployerContract.getDispatcher();
  release.dispatcher = ensureDispatcher(dispatcher).id;

  // Retrieve other data from ComptrollerLib
  let comptrollerLibContract = ComptrollerLibContract.bind(comptrollerLib);
  release.engine = comptrollerLibContract.getEngine().toHex();

  let routes = comptrollerLibContract.getRoutes();
  release.derivativePriceFeed = ensurePriceFeed(routes.value0).id;
  release.feeManager = routes.value1.toHex();
  // .value2 is fundDeployer, not needed
  release.integrationManager = routes.value3.toHex();
  release.policyManager = routes.value4.toHex();
  release.primitivePriceFeed = routes.value5.toHex();
  release.valueInterpreter = routes.value6.toHex();
  release.save();

  return release;
}
