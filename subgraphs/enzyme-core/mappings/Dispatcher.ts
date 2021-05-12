import { Address, DataSourceContext } from '@graphprotocol/graph-ts';
import { ZERO_ADDRESS } from '../../../utils/constants';
import { uniqueEventId } from '../../../utils/utils/id';
import { ensureManager } from '../entities/Account';
import { ensureComptrollerProxy } from '../entities/ComptrollerProxy';
import { ensureMigration, generateMigrationId, useMigration } from '../entities/Migration';
import { ensureNetwork } from '../entities/Network';
import { ensureRelease } from '../entities/Release';
import { ensureTransaction } from '../entities/Transaction';
import { useVault } from '../entities/Vault';
import {
  CurrentFundDeployerSet,
  MigrationCancelled,
  MigrationExecuted,
  MigrationInCancelHookFailed,
  MigrationOutHookFailed,
  MigrationSignaled,
  MigrationTimelockSet,
  NominatedOwnerRemoved,
  NominatedOwnerSet,
  OwnershipTransferred,
  SharesTokenSymbolSet,
  VaultProxyDeployed,
} from '../generated/DispatcherContract';
import {
  DispatcherOwnershipTransferredEvent,
  FundDeployerSetEvent,
  MigrationCancelledEvent,
  MigrationExecutedEvent,
  MigrationInCancelHookFailedEvent,
  MigrationOutHookFailedEvent,
  MigrationSignaledEvent,
  MigrationTimelockSetEvent,
  NominatedOwnerRemovedEvent,
  NominatedOwnerSetEvent,
  SharesTokenSymbolSetEvent,
  VaultProxyDeployedEvent,
} from '../generated/schema';
import { ComptrollerLibDataSource } from '../generated/templates';

export function handleCurrentFundDeployerSet(event: CurrentFundDeployerSet): void {
  // NOTE: This is the first event on kovan.
  let network = ensureNetwork(event);

  // Set up release (each new fund deployer is a release)
  let release = ensureRelease(event.params.nextFundDeployer.toHex(), event);

  network.currentRelease = release.id;
  network.save();

  let fundDeployerSet = new FundDeployerSetEvent(uniqueEventId(event));
  fundDeployerSet.timestamp = event.block.timestamp;
  fundDeployerSet.transaction = ensureTransaction(event).id;
  if (event.params.prevFundDeployer != ZERO_ADDRESS) {
    fundDeployerSet.prevFundDeployer = event.params.prevFundDeployer.toHex();
  }
  fundDeployerSet.nextFundDeployer = event.params.nextFundDeployer.toHex();
  fundDeployerSet.save();

  if (!event.params.prevFundDeployer.equals(ZERO_ADDRESS)) {
    let prevRelease = ensureRelease(event.params.prevFundDeployer.toHex(), event);
    prevRelease.current = false;
    prevRelease.close = event.block.timestamp;
    prevRelease.save();
  }
}

export function handleMigrationCancelled(event: MigrationCancelled): void {
  let migrationCancellation = new MigrationCancelledEvent(uniqueEventId(event));
  let migrationId = generateMigrationId(
    event.params.vaultProxy.toHex(),
    event.params.prevFundDeployer.toHex(),
    event.params.nextFundDeployer.toHex(),
    event.params.executableTimestamp.toString(),
  );

  let migration = useMigration(migrationId);

  migrationCancellation.vault = useVault(event.params.vaultProxy.toHex()).id;
  migrationCancellation.timestamp = event.block.timestamp;
  migrationCancellation.transaction = ensureTransaction(event).id;
  migrationCancellation.migration = migration.id;
  migrationCancellation.executableTimestamp = event.params.executableTimestamp;
  migrationCancellation.save();

  migration.cancelled = true;
  migration.save();

  let comptrollerProxy = ensureComptrollerProxy(Address.fromString(migration.nextAccessor), event);
  comptrollerProxy.vault = null;
  comptrollerProxy.status = 'FREE';
  comptrollerProxy.save();
}

export function handleMigrationExecuted(event: MigrationExecuted): void {
  let migrationExecution = new MigrationExecutedEvent(uniqueEventId(event));
  let migrationId = generateMigrationId(
    event.params.vaultProxy.toHex(),
    event.params.prevFundDeployer.toHex(),
    event.params.nextFundDeployer.toHex(),
    event.params.executableTimestamp.toString(),
  );

  let migration = useMigration(migrationId);

  migrationExecution.vault = useVault(event.params.vaultProxy.toHex()).id;
  migrationExecution.timestamp = event.block.timestamp;
  migrationExecution.transaction = ensureTransaction(event).id;
  migrationExecution.migration = migration.id;
  migrationExecution.executableTimestamp = event.params.executableTimestamp;
  migrationExecution.save();

  let vault = useVault(event.params.vaultProxy.toHex());
  let prevAccessor = vault.accessor;
  vault.release = ensureRelease(event.params.nextFundDeployer.toHex(), event).id;
  vault.accessor = ensureComptrollerProxy(Address.fromString(migration.nextAccessor), event).id;
  vault.save();

  migration.executed = true;
  migration.save();

  // start monitoring the Comptroller Proxy
  let comptrollerContext = new DataSourceContext();
  comptrollerContext.setString('vaultProxy', event.params.vaultProxy.toHex());
  ComptrollerLibDataSource.createWithContext(event.params.nextVaultAccessor, comptrollerContext);

  let comptrollerProxy = ensureComptrollerProxy(Address.fromString(migration.nextAccessor), event);
  comptrollerProxy.activationTime = event.block.timestamp;
  comptrollerProxy.status = 'COMMITTED';
  comptrollerProxy.save();

  let prevComptrollerProxy = ensureComptrollerProxy(Address.fromString(prevAccessor), event);
  prevComptrollerProxy.destructionTime = event.block.timestamp;
  prevComptrollerProxy.status = 'DESTRUCTED';
  prevComptrollerProxy.save();
}

export function handleMigrationSignaled(event: MigrationSignaled): void {
  let vault = useVault(event.params.vaultProxy.toHex());

  let migrationSignaling = new MigrationSignaledEvent(uniqueEventId(event));
  migrationSignaling.vault = vault.id;
  migrationSignaling.timestamp = event.block.timestamp;
  migrationSignaling.transaction = ensureTransaction(event).id;
  migrationSignaling.migration = ensureMigration(event).id;
  migrationSignaling.save();

  let comptrollerProxy = ensureComptrollerProxy(event.params.nextVaultAccessor, event);
  comptrollerProxy.vault = vault.id;
  comptrollerProxy.status = 'SIGNALLED';
  comptrollerProxy.save();
}

export function handleMigrationInCancelHookFailed(event: MigrationInCancelHookFailed): void {
  let cancelHookFailed = new MigrationInCancelHookFailedEvent(uniqueEventId(event));
  cancelHookFailed.vault = useVault(event.params.vaultProxy.toHex()).id;
  cancelHookFailed.timestamp = event.block.timestamp;
  cancelHookFailed.transaction = ensureTransaction(event).id;

  cancelHookFailed.vaultProxy = event.params.vaultProxy.toHex();
  cancelHookFailed.prevFundDeployer = event.params.prevFundDeployer.toHex();
  cancelHookFailed.nextFundDeployer = event.params.nextFundDeployer.toHex();
  cancelHookFailed.nextVaultLib = event.params.nextVaultLib.toHex();
  cancelHookFailed.nextVaultAccessor = event.params.nextVaultAccessor.toHex();
  cancelHookFailed.failureReturnData = event.params.failureReturnData.toHexString();
  cancelHookFailed.save();
}

export function handleMigrationOutHookFailed(event: MigrationOutHookFailed): void {
  let outHookFailed = new MigrationOutHookFailedEvent(uniqueEventId(event));
  outHookFailed.vault = useVault(event.params.vaultProxy.toHex()).id;
  outHookFailed.timestamp = event.block.timestamp;
  outHookFailed.transaction = ensureTransaction(event).id;

  outHookFailed.vaultProxy = event.params.vaultProxy.toHex();
  outHookFailed.prevFundDeployer = event.params.prevFundDeployer.toHex();
  outHookFailed.nextFundDeployer = event.params.nextFundDeployer.toHex();
  outHookFailed.nextVaultLib = event.params.nextVaultLib.toHex();
  outHookFailed.nextVaultAccessor = event.params.nextVaultAccessor.toHex();
  outHookFailed.failureReturnData = event.params.failureReturnData.toHexString();
  outHookFailed.save();
}

export function handleMigrationTimelockSet(event: MigrationTimelockSet): void {
  let timelockSet = new MigrationTimelockSetEvent(uniqueEventId(event));
  timelockSet.transaction = ensureTransaction(event).id;
  timelockSet.timestamp = event.block.timestamp;
  timelockSet.prevTimelock = event.params.prevTimelock;
  timelockSet.nextTimelock = event.params.nextTimelock;
  timelockSet.save();
}

export function handleSharesTokenSymbolSet(event: SharesTokenSymbolSet): void {
  let symbolSet = new SharesTokenSymbolSetEvent(uniqueEventId(event));
  symbolSet.transaction = ensureTransaction(event).id;
  symbolSet.timestamp = event.block.timestamp;
  symbolSet.sharesTokenSymbol = event.params._nextSymbol;
  symbolSet.save();
}

export function handleNominatedOwnerRemoved(event: NominatedOwnerRemoved): void {
  let ownerRemoved = new NominatedOwnerRemovedEvent(uniqueEventId(event));
  ownerRemoved.transaction = ensureTransaction(event).id;
  ownerRemoved.timestamp = event.block.timestamp;
  ownerRemoved.nominatedOwner = event.params.nominatedOwner.toHex();
  ownerRemoved.save();
}

export function handleNominatedOwnerSet(event: NominatedOwnerSet): void {
  let ownerSet = new NominatedOwnerSetEvent(uniqueEventId(event));
  ownerSet.transaction = ensureTransaction(event).id;
  ownerSet.timestamp = event.block.timestamp;
  ownerSet.nominatedOwner = event.params.nominatedOwner.toHex();
  ownerSet.save();
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  let transferred = new DispatcherOwnershipTransferredEvent(uniqueEventId(event));
  transferred.transaction = ensureTransaction(event).id;
  transferred.timestamp = event.block.timestamp;
  transferred.prevOwner = event.params.prevOwner.toHex();
  transferred.nextOwner = event.params.nextOwner.toHex();
  transferred.save();
}

export function handleVaultProxyDeployed(event: VaultProxyDeployed): void {
  let vaultDeployment = new VaultProxyDeployedEvent(uniqueEventId(event));
  vaultDeployment.vault = event.params.vaultProxy.toHex();
  vaultDeployment.timestamp = event.block.timestamp;
  vaultDeployment.transaction = ensureTransaction(event).id;
  vaultDeployment.fundDeployer = event.params.fundDeployer.toHex();
  vaultDeployment.owner = ensureManager(event.params.owner, event).id;
  vaultDeployment.vaultLib = event.params.vaultLib.toHex();
  vaultDeployment.accessor = event.params.vaultAccessor.toHex();
  vaultDeployment.fundName = event.params.fundName;
  vaultDeployment.save();
}
