import { zeroAddress } from '../constants';
import { ensureContract } from '../entities/Contract';
import { ensureFundDeployer } from '../entities/FundDeployer';
import { ensureTransaction } from '../entities/Transaction';
import { createRelease, useRelease } from '../entities/Release';
import {
  CurrentFundDeployerSet,
  MigrationCancelled,
  MigrationExecuted,
  MigrationSignaled,
  PostCancelMigrationOriginHookFailed,
  PostCancelMigrationTargetHookFailed,
  PostMigrateOriginHookFailed,
  PostSignalMigrationOriginHookFailed,
  PreMigrateOriginHookFailed,
  PreSignalMigrationOriginHookFailed,
  VaultProxyDeployed,
} from '../generated/DispatcherContract';
import {
  FundDeployerSetEvent,
  MigrationCancellationEvent,
  MigrationExecutionEvent,
  MigrationSignalingEvent,
} from '../generated/schema';
import { genericId } from '../utils/genericId';

export function handleCurrentFundDeployerSet(event: CurrentFundDeployerSet): void {
  let fundDeployerSet = new FundDeployerSetEvent(genericId(event));

  if (!event.params.prevFundDeployer.equals(zeroAddress)) {
    let prevFundDeployer = ensureFundDeployer(event.params.prevFundDeployer);
    /*     prevFundDeployer.current = false;
    prevFundDeployer.currentEnd = event.block.timestamp; */
    prevFundDeployer.save();
    fundDeployerSet.prevFundDeployer = prevFundDeployer.id;

    // Update previous release
    let prevRelease = useRelease(prevFundDeployer.id);
    prevRelease.current = false;
    prevRelease.currentEnd = event.block.timestamp;
  }

  let nextFundDeployer = ensureFundDeployer(event.params.nextFundDeployer);
  /*   nextFundDeployer.current = true;
  nextFundDeployer.currentStart = event.block.timestamp; */
  nextFundDeployer.save();

  fundDeployerSet.contract = ensureContract(event.address, 'Dispatcher', event).id;
  fundDeployerSet.timestamp = event.block.timestamp;
  fundDeployerSet.nextFundDeployer = nextFundDeployer.id;
  fundDeployerSet.transaction = ensureTransaction(event).id;
  fundDeployerSet.save();

  // TODO: Create a new release and populate it with the data fetched from the new fund deployer (vaultlib, accessorlib, etc)

  // Create new release
  let nextRelease = createRelease(nextFundDeployer.id);
  nextRelease.current = true;
  nextRelease.currentStart = event.block.timestamp;

  nextRelease.save();
}

export function handleMigrationCancelled(event: MigrationCancelled): void {
  let migrationCancellation = new MigrationCancellationEvent(genericId(event));
}
export function handleMigrationExecuted(event: MigrationExecuted): void {
  let migrationExecution = new MigrationExecutionEvent(genericId(event));
}
export function handleMigrationSignaled(event: MigrationSignaled): void {
  let migrationSignaling = new MigrationSignalingEvent(genericId(event));
}
export function handlePostCancelMigrationOriginHookFailed(event: PostCancelMigrationOriginHookFailed): void {}
export function handlePostCancelMigrationTargetHookFailed(event: PostCancelMigrationTargetHookFailed): void {}
export function handlePostMigrateOriginHookFailed(event: PostMigrateOriginHookFailed): void {}
export function handlePostSignalMigrationOriginHookFailed(event: PostSignalMigrationOriginHookFailed): void {}
export function handlePreMigrateOriginHookFailed(event: PreMigrateOriginHookFailed): void {}
export function handlePreSignalMigrationOriginHookFailed(event: PreSignalMigrationOriginHookFailed): void {}
export function handleVaultProxyDeployed(event: VaultProxyDeployed): void {}
