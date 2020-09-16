import { zeroAddress } from '../constants';
import { ensureContract } from '../entities/Contract';
import { ensureFundDeployer } from '../entities/FundDeployer';
import { ensureTransaction } from '../entities/Transaction';
import { createRelease, useRelease } from '../entities/Release';
import { useFund } from '../entities/Fund';
import { useAccount } from '../entities/Account';
import { ensureMigration, useMigration, generateMigrationId } from '../entities/Migration';
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
    // modifying fields of previous fund deployer?
    prevFundDeployer.save();

    fundDeployerSet.prevFundDeployer = prevFundDeployer.id;

    // Update previous Release
    let prevRelease = useRelease(prevFundDeployer.id);
    prevRelease.current = false;
    prevRelease.currentEnd = event.block.timestamp;
    prevRelease.save();
  }

  let nextFundDeployer = ensureFundDeployer(event.params.nextFundDeployer);
  // modifying fields of next fund deployer?
  nextFundDeployer.save();

  fundDeployerSet.contract = ensureContract(event.address, 'Dispatcher', event).id;
  fundDeployerSet.timestamp = event.block.timestamp;
  fundDeployerSet.nextFundDeployer = nextFundDeployer.id;
  fundDeployerSet.transaction = ensureTransaction(event).id;
  fundDeployerSet.save();

  // Create new release
  let nextRelease = createRelease(event);
  // Add data here? Or do that in createRelease?
  nextRelease.save();
}

export function handleMigrationCancelled(event: MigrationCancelled): void {
  let migrationCancellation = new MigrationCancellationEvent(genericId(event));
  let migrationId = generateMigrationId(
    event.params.vaultProxy,
    event.params.prevFundDeployer,
    event.params.nextFundDeployer,
  );
  // Retrieving the migration request
  let migration = useMigration(migrationId);
  // Setting the event
  migrationCancellation.fund = useFund(event.params.vaultProxy.toHex()).id;
  migrationCancellation.account = useAccount(event.address.toHex()).id;
  migrationCancellation.contract = ensureContract(event.address, 'Dispatcher', event).id;
  migrationCancellation.timestamp = event.block.timestamp;
  migrationCancellation.transaction = ensureTransaction(event).id;
  migrationCancellation.migration = migration.id;
  migrationCancellation.signalTimestamp = event.params.signalTimestamp;
  migrationCancellation.save();

  // Setting our migration as canceled
  migration.canceled = true;
  migration.save();
}
export function handleMigrationExecuted(event: MigrationExecuted): void {
  let migrationExecution = new MigrationExecutionEvent(genericId(event));
  let migrationId = generateMigrationId(
    event.params.vaultProxy,
    event.params.prevFundDeployer,
    event.params.nextFundDeployer,
  );
  // Retrieving the migration request
  let migration = useMigration(migrationId);
  // Setting the event
  migrationExecution.fund = useFund(event.params.vaultProxy.toHex()).id;
  migrationExecution.account = useAccount(event.address.toHex()).id;
  migrationExecution.timestamp = event.block.timestamp;
  migrationExecution.transaction = ensureTransaction(event).id;
  migrationExecution.contract = ensureContract(event.address, 'Dispatcher', event).id;
  migrationExecution.migration = migration.id;
  migrationExecution.signalTimestamp = event.params.signalTimestamp;
  migrationExecution.save();

  // Updating our fund to the proper release.
  let fund = useFund(event.params.vaultProxy.toHex());
  fund.release = useRelease(event.params.nextFundDeployer.toHex()).id;

  // Setting the migration as executed
  migration.executed = true;
  migration.save();
}
export function handleMigrationSignaled(event: MigrationSignaled): void {
  let migrationSignaling = new MigrationSignalingEvent(genericId(event));
  // Creating a migration instance (or recovering previously canceled one)
  let migration = ensureMigration(event);
  // Setting the event
  migrationSignaling.fund = useFund(event.params.vaultProxy.toHex()).id;
  migrationSignaling.account = useAccount(event.address.toHex()).id;
  migrationSignaling.timestamp = event.block.timestamp;
  migrationSignaling.transaction = ensureTransaction(event).id;
  migrationSignaling.contract = ensureContract(event.address, 'Dispatcher', event).id;
  migrationSignaling.migration = migration.id;
  migrationSignaling.save();
}
export function handlePostCancelMigrationOriginHookFailed(event: PostCancelMigrationOriginHookFailed): void {}
export function handlePostCancelMigrationTargetHookFailed(event: PostCancelMigrationTargetHookFailed): void {}
export function handlePostMigrateOriginHookFailed(event: PostMigrateOriginHookFailed): void {}
export function handlePostSignalMigrationOriginHookFailed(event: PostSignalMigrationOriginHookFailed): void {}
export function handlePreMigrateOriginHookFailed(event: PreMigrateOriginHookFailed): void {}
export function handlePreSignalMigrationOriginHookFailed(event: PreSignalMigrationOriginHookFailed): void {}
export function handleVaultProxyDeployed(event: VaultProxyDeployed): void {}
