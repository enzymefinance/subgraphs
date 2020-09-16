import { zeroAddress } from '../constants';
import { ensureContract } from '../entities/Contract';
import { ensureFundDeployer } from '../entities/FundDeployer';
import { ensureTransaction } from '../entities/Transaction';
import { createRelease, useRelease } from '../entities/Release';
import { useFund } from '../entities/Fund';
import { useAccount, ensureAccount } from '../entities/Account';
import { useComptroller, ensureComptroller } from '../entities/Comptroller';
import { ensureVaultLib } from '../entities/VaultLib';
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
  PostCancelMigrationOriginHookFailureEvent,
  PostCancelMigrationTargetHookFailureEvent,
  PreMigrateOriginHookFailureEvent,
  PostMigrateOriginHookFailureEvent,
  PreSignalMigrationOriginHookFailureEvent,
  PostSignalMigrationOriginHookFailureEvent,
  VaultProxyDeploymentEvent,
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

  // Create new release.
  createRelease(event);
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
  fund.accessor = useComptroller(migration.nextAccessor).id;

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
export function handlePostCancelMigrationOriginHookFailed(event: PostCancelMigrationOriginHookFailed): void {
  let hook = new PostCancelMigrationOriginHookFailureEvent(genericId(event));
  let migrationId = generateMigrationId(
    event.params.vaultProxy,
    event.params.prevFundDeployer,
    event.params.nextFundDeployer,
  );
  // Retrieving the migration request
  let migration = useMigration(migrationId);
  // Setting the event
  hook.fund = useFund(event.params.vaultProxy.toHex()).id;
  hook.account = useAccount(event.address.toHex()).id;
  hook.contract = ensureContract(event.address, 'Dispatcher', event).id;
  hook.timestamp = event.block.timestamp;
  hook.transaction = ensureTransaction(event).id;
  hook.migration = migration.id;
  hook.signalTimestamp = event.params.signalTimestamp;
  hook.failureData = event.params.failureReturnData;
  hook.save();
}
export function handlePostCancelMigrationTargetHookFailed(event: PostCancelMigrationTargetHookFailed): void {
  let hook = new PostCancelMigrationTargetHookFailureEvent(genericId(event));
  let migrationId = generateMigrationId(
    event.params.vaultProxy,
    event.params.prevFundDeployer,
    event.params.nextFundDeployer,
  );
  // Retrieving the migration request
  let migration = useMigration(migrationId);
  // Setting the event
  hook.fund = useFund(event.params.vaultProxy.toHex()).id;
  hook.account = useAccount(event.address.toHex()).id;
  hook.contract = ensureContract(event.address, 'Dispatcher', event).id;
  hook.timestamp = event.block.timestamp;
  hook.transaction = ensureTransaction(event).id;
  hook.migration = migration.id;
  hook.signalTimestamp = event.params.signalTimestamp;
  hook.failureData = event.params.failureReturnData;
  hook.save();
}

export function handlePreMigrateOriginHookFailed(event: PreMigrateOriginHookFailed): void {
  let hook = new PreMigrateOriginHookFailureEvent(genericId(event));
  let migrationId = generateMigrationId(
    event.params.vaultProxy,
    event.params.prevFundDeployer,
    event.params.nextFundDeployer,
  );
  // Retrieving the migration request
  let migration = useMigration(migrationId);
  // Setting the event
  hook.fund = useFund(event.params.vaultProxy.toHex()).id;
  hook.account = useAccount(event.address.toHex()).id;
  hook.contract = ensureContract(event.address, 'Dispatcher', event).id;
  hook.timestamp = event.block.timestamp;
  hook.transaction = ensureTransaction(event).id;
  hook.migration = migration.id;
  hook.signalTimestamp = event.params.signalTimestamp;
  hook.failureData = event.params.failureReturnData;
  hook.save();
}

export function handlePostMigrateOriginHookFailed(event: PostMigrateOriginHookFailed): void {
  let hook = new PostMigrateOriginHookFailureEvent(genericId(event));
  let migrationId = generateMigrationId(
    event.params.vaultProxy,
    event.params.prevFundDeployer,
    event.params.nextFundDeployer,
  );
  // Retrieving the migration request
  let migration = useMigration(migrationId);
  // Setting the event
  hook.fund = useFund(event.params.vaultProxy.toHex()).id;
  hook.account = useAccount(event.address.toHex()).id;
  hook.contract = ensureContract(event.address, 'Dispatcher', event).id;
  hook.timestamp = event.block.timestamp;
  hook.transaction = ensureTransaction(event).id;
  hook.migration = migration.id;
  hook.signalTimestamp = event.params.signalTimestamp;
  hook.failureData = event.params.failureReturnData;
  hook.save();
}

export function handlePreSignalMigrationOriginHookFailed(event: PreSignalMigrationOriginHookFailed): void {
  let hook = new PreSignalMigrationOriginHookFailureEvent(genericId(event));
  let migrationId = generateMigrationId(
    event.params.vaultProxy,
    event.params.prevFundDeployer,
    event.params.nextFundDeployer,
  );
  // Retrieving the migration request
  let migration = useMigration(migrationId);
  // Setting the event
  hook.fund = useFund(event.params.vaultProxy.toHex()).id;
  hook.account = useAccount(event.address.toHex()).id;
  hook.contract = ensureContract(event.address, 'Dispatcher', event).id;
  hook.timestamp = event.block.timestamp;
  hook.transaction = ensureTransaction(event).id;
  hook.migration = migration.id;
  hook.failureData = event.params.failureReturnData;
  hook.save();
}

export function handlePostSignalMigrationOriginHookFailed(event: PostSignalMigrationOriginHookFailed): void {
  let hook = new PostSignalMigrationOriginHookFailureEvent(genericId(event));
  let migrationId = generateMigrationId(
    event.params.vaultProxy,
    event.params.prevFundDeployer,
    event.params.nextFundDeployer,
  );
  // Retrieving the migration request
  let migration = useMigration(migrationId);
  // Setting the event
  hook.fund = useFund(event.params.vaultProxy.toHex()).id;
  hook.account = useAccount(event.address.toHex()).id;
  hook.contract = ensureContract(event.address, 'Dispatcher', event).id;
  hook.timestamp = event.block.timestamp;
  hook.transaction = ensureTransaction(event).id;
  hook.migration = migration.id;
  hook.failureData = event.params.failureReturnData;
  hook.save();
}

export function handleVaultProxyDeployed(event: VaultProxyDeployed): void {
  // This gets called by the FundDeployer contract to deploy the VaultProxy
  let vaultDeployment = new VaultProxyDeploymentEvent(genericId(event));
  vaultDeployment.contract = ensureContract(event.address, 'Dispatcher', event).id;
  vaultDeployment.timestamp = event.block.timestamp;
  vaultDeployment.transaction = ensureTransaction(event).id;
  vaultDeployment.fundDeployer = ensureFundDeployer(event.params.fundDeployer).id;
  vaultDeployment.owner = ensureAccount(event.params.owner, event).id;
  // We can't useFund yet since it is created by the NewFundDeployed event in the FundDeployer contract
  // This means that we don't actually create a VaultProxy here, it's just referenced here
  // Workaround might be to create VaultProxy high-level entity?
  // Might not matter though since unless createNewFund fails at the "3. Set config" stage, fund will get created will all info
  vaultDeployment.fund = event.params.vaultProxy.toHex();
  vaultDeployment.vaultLib = ensureVaultLib(event.params.vaultLib).id;
  vaultDeployment.accessor = ensureComptroller(event.params.vaultAccessor).id;
  vaultDeployment.fundName = event.params.fundName;
}
