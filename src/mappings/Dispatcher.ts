import { zeroAddress } from '../constants';
import { ensureManager, useAccount } from '../entities/Account';
import { ensureContract } from '../entities/Contract';
import { useFund } from '../entities/Fund';
import { ensureMigration, generateMigrationId, useMigration } from '../entities/Migration';
import { createRelease, useRelease } from '../entities/Release';
import { ensureTransaction } from '../entities/Transaction';
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
  MigrationCancelledEvent,
  MigrationExecutedEvent,
  MigrationSignaledEvent,
  PostCancelMigrationOriginHookFailedEvent,
  PostCancelMigrationTargetHookFailedEvent,
  PostMigrateOriginHookFailedEvent,
  PostSignalMigrationOriginHookFailedEvent,
  PreMigrateOriginHookFailedEvent,
  PreSignalMigrationOriginHookFailedEvent,
  VaultProxyDeployedEvent,
} from '../generated/schema';
import { genericId } from '../utils/genericId';

export function handleCurrentFundDeployerSet(event: CurrentFundDeployerSet): void {
  let fundDeployerSet = new FundDeployerSetEvent(genericId(event));
  fundDeployerSet.contract = ensureContract(event.address, 'Dispatcher').id;
  fundDeployerSet.timestamp = event.block.timestamp;
  fundDeployerSet.transaction = ensureTransaction(event).id;
  if (event.params.prevFundDeployer != zeroAddress) {
    fundDeployerSet.prevFundDeployer = ensureContract(event.params.prevFundDeployer, 'FundDeployer').id;
  }
  fundDeployerSet.nextFundDeployer = ensureContract(event.params.nextFundDeployer, 'FundDeployer').id;
  fundDeployerSet.save();

  if (!event.params.prevFundDeployer.equals(zeroAddress)) {
    // Update previous release
    let prevRelease = useRelease(event.params.prevFundDeployer.toHex());
    prevRelease.current = false;
    prevRelease.close = event.block.timestamp;
    prevRelease.save();
  }

  // Create new release
  createRelease(event);
}

export function handleMigrationCancelled(event: MigrationCancelled): void {
  let migrationCancellation = new MigrationCancelledEvent(genericId(event));
  let migrationId = generateMigrationId(
    event.params.vaultProxy.toHex(),
    event.params.prevFundDeployer.toHex(),
    event.params.nextFundDeployer.toHex(),
    event.params.signalTimestamp.toString(),
  );

  // Retrieving the migration request
  let migration = useMigration(migrationId);

  // Setting the event
  migrationCancellation.fund = useFund(event.params.vaultProxy.toHex()).id;
  migrationCancellation.account = useAccount(event.address.toHex()).id;
  migrationCancellation.contract = event.address.toHex();
  migrationCancellation.timestamp = event.block.timestamp;
  migrationCancellation.transaction = ensureTransaction(event).id;
  migrationCancellation.migration = migration.id;
  migrationCancellation.signalTimestamp = event.params.signalTimestamp;
  migrationCancellation.save();

  // Setting our migration as cancelled
  migration.cancelled = true;
  migration.save();
}
export function handleMigrationExecuted(event: MigrationExecuted): void {
  let migrationExecution = new MigrationExecutedEvent(genericId(event));
  let migrationId = generateMigrationId(
    event.params.vaultProxy.toHex(),
    event.params.prevFundDeployer.toHex(),
    event.params.nextFundDeployer.toHex(),
    event.params.signalTimestamp.toString(),
  );

  // Retrieving the migration request
  let migration = useMigration(migrationId);

  // Setting the event
  migrationExecution.fund = useFund(event.params.vaultProxy.toHex()).id;
  migrationExecution.account = useAccount(event.address.toHex()).id;
  migrationExecution.timestamp = event.block.timestamp;
  migrationExecution.transaction = ensureTransaction(event).id;
  migrationExecution.contract = event.address.toHex();
  migrationExecution.migration = migration.id;
  migrationExecution.signalTimestamp = event.params.signalTimestamp;
  migrationExecution.save();

  // Updating our fund to the proper release.
  let fund = useFund(event.params.vaultProxy.toHex());
  fund.release = useRelease(event.params.nextFundDeployer.toHex()).id;
  fund.accessor = migration.nextAccessor;

  // Setting the migration as executed
  migration.executed = true;
  migration.save();
}
export function handleMigrationSignaled(event: MigrationSignaled): void {
  let migrationSignaling = new MigrationSignaledEvent(genericId(event));

  // Creating a migration instance (or recovering previously cancelled one)
  let migration = ensureMigration(event);

  // Setting the event
  migrationSignaling.fund = useFund(event.params.vaultProxy.toHex()).id;
  migrationSignaling.account = useAccount(event.address.toHex()).id;
  migrationSignaling.timestamp = event.block.timestamp;
  migrationSignaling.transaction = ensureTransaction(event).id;
  migrationSignaling.contract = event.address.toHex();
  migrationSignaling.migration = migration.id;
  migrationSignaling.save();
}

export function handlePostCancelMigrationOriginHookFailed(event: PostCancelMigrationOriginHookFailed): void {
  let hook = new PostCancelMigrationOriginHookFailedEvent(genericId(event));
  let migrationId = generateMigrationId(
    event.params.vaultProxy.toHex(),
    event.params.prevFundDeployer.toHex(),
    event.params.nextFundDeployer.toHex(),
    event.params.signalTimestamp.toString(),
  );

  // Retrieving the migration request
  let migration = useMigration(migrationId);

  // Setting the event
  hook.fund = useFund(event.params.vaultProxy.toHex()).id;
  hook.account = useAccount(event.address.toHex()).id;
  hook.contract = event.address.toHex();
  hook.timestamp = event.block.timestamp;
  hook.transaction = ensureTransaction(event).id;
  hook.migration = migration.id;
  hook.signalTimestamp = event.params.signalTimestamp;
  hook.failureData = event.params.failureReturnData;
  hook.save();
}

export function handlePostCancelMigrationTargetHookFailed(event: PostCancelMigrationTargetHookFailed): void {
  let hook = new PostCancelMigrationTargetHookFailedEvent(genericId(event));
  let migrationId = generateMigrationId(
    event.params.vaultProxy.toHex(),
    event.params.prevFundDeployer.toHex(),
    event.params.nextFundDeployer.toHex(),
    event.params.signalTimestamp.toString(),
  );

  // Retrieving the migration request
  let migration = useMigration(migrationId);

  // Setting the event
  hook.fund = useFund(event.params.vaultProxy.toHex()).id;
  hook.account = useAccount(event.address.toHex()).id;
  hook.contract = event.address.toHex();
  hook.timestamp = event.block.timestamp;
  hook.transaction = ensureTransaction(event).id;
  hook.migration = migration.id;
  hook.signalTimestamp = event.params.signalTimestamp;
  hook.failureData = event.params.failureReturnData;
  hook.save();
}

export function handlePreMigrateOriginHookFailed(event: PreMigrateOriginHookFailed): void {
  let hook = new PreMigrateOriginHookFailedEvent(genericId(event));
  let migrationId = generateMigrationId(
    event.params.vaultProxy.toHex(),
    event.params.prevFundDeployer.toHex(),
    event.params.nextFundDeployer.toHex(),
    event.params.signalTimestamp.toString(),
  );

  // Retrieving the migration request
  let migration = useMigration(migrationId);

  // Setting the event
  hook.fund = useFund(event.params.vaultProxy.toHex()).id;
  hook.account = useAccount(event.address.toHex()).id;
  hook.contract = event.address.toHex();
  hook.timestamp = event.block.timestamp;
  hook.transaction = ensureTransaction(event).id;
  hook.migration = migration.id;
  hook.signalTimestamp = event.params.signalTimestamp;
  hook.failureData = event.params.failureReturnData;
  hook.save();
}

export function handlePostMigrateOriginHookFailed(event: PostMigrateOriginHookFailed): void {
  let hook = new PostMigrateOriginHookFailedEvent(genericId(event));
  let migrationId = generateMigrationId(
    event.params.vaultProxy.toHex(),
    event.params.prevFundDeployer.toHex(),
    event.params.nextFundDeployer.toHex(),
    event.params.signalTimestamp.toString(),
  );

  // Retrieving the migration request
  let migration = useMigration(migrationId);

  // Setting the event
  hook.fund = useFund(event.params.vaultProxy.toHex()).id;
  hook.account = useAccount(event.address.toHex()).id;
  hook.contract = event.address.toHex();
  hook.timestamp = event.block.timestamp;
  hook.transaction = ensureTransaction(event).id;
  hook.migration = migration.id;
  hook.signalTimestamp = event.params.signalTimestamp;
  hook.failureData = event.params.failureReturnData;
  hook.save();
}

export function handlePreSignalMigrationOriginHookFailed(event: PreSignalMigrationOriginHookFailed): void {
  let hook = new PreSignalMigrationOriginHookFailedEvent(genericId(event));
  let migrationId = generateMigrationId(
    event.params.vaultProxy.toHex(),
    event.params.prevFundDeployer.toHex(),
    event.params.nextFundDeployer.toHex(),
    event.block.timestamp.toString(),
  );

  // Retrieving the migration request
  let migration = useMigration(migrationId);

  // Setting the event
  hook.fund = useFund(event.params.vaultProxy.toHex()).id;
  hook.account = useAccount(event.address.toHex()).id;
  hook.contract = event.address.toHex();
  hook.timestamp = event.block.timestamp;
  hook.transaction = ensureTransaction(event).id;
  hook.migration = migration.id;
  hook.failureData = event.params.failureReturnData;
  hook.save();
}

export function handlePostSignalMigrationOriginHookFailed(event: PostSignalMigrationOriginHookFailed): void {
  let hook = new PostSignalMigrationOriginHookFailedEvent(genericId(event));
  let migrationId = generateMigrationId(
    event.params.vaultProxy.toHex(),
    event.params.prevFundDeployer.toHex(),
    event.params.nextFundDeployer.toHex(),
    event.block.timestamp.toString(),
  );

  // Retrieving the migration request
  let migration = useMigration(migrationId);

  // Setting the event
  hook.fund = useFund(event.params.vaultProxy.toHex()).id;
  hook.account = useAccount(event.address.toHex()).id;
  hook.contract = event.address.toHex();
  hook.timestamp = event.block.timestamp;
  hook.transaction = ensureTransaction(event).id;
  hook.migration = migration.id;
  hook.failureData = event.params.failureReturnData;
  hook.save();
}

export function handleVaultProxyDeployed(event: VaultProxyDeployed): void {
  // This gets called by the FundDeployer contract to deploy the VaultProxy
  let vaultDeployment = new VaultProxyDeployedEvent(genericId(event));
  vaultDeployment.fund = event.params.vaultProxy.toHex();
  vaultDeployment.account = ensureManager(event.params.owner, event).id;
  vaultDeployment.contract = event.address.toHex();
  vaultDeployment.timestamp = event.block.timestamp;
  vaultDeployment.transaction = ensureTransaction(event).id;
  vaultDeployment.fundDeployer = event.params.fundDeployer.toHex();
  vaultDeployment.owner = ensureManager(event.params.owner, event).id;
  vaultDeployment.vaultLib = event.params.vaultLib.toHex();
  vaultDeployment.accessor = event.params.vaultAccessor.toHex();
  vaultDeployment.fundName = event.params.fundName;
  vaultDeployment.save();
}
