import { ZERO_ADDRESS } from '@enzymefinance/subgraph-utils';
import { Address, DataSourceContext } from '@graphprotocol/graph-ts';
import { ensureComptroller } from '../entities/Comptroller';
import { generateMigrationId, useMigration } from '../entities/Migration';
import { ensureNetwork } from '../entities/Network';
import { ensureRelease } from '../entities/Release';
import { useVault } from '../entities/Vault';
import { trackVaultMetric } from '../entities/VaultMetric';
import { release3Addresses, release4Addresses } from '../generated/addresses';
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
import { Migration } from '../generated/schema';
import { ComptrollerLib3DataSource, ComptrollerLib4DataSource } from '../generated/templates';

export function handleCurrentFundDeployerSet(event: CurrentFundDeployerSet): void {
  let network = ensureNetwork(event);
  let release = ensureRelease(event.params.nextFundDeployer, event);

  network.currentRelease = release.id;
  network.save();

  if (!event.params.prevFundDeployer.equals(ZERO_ADDRESS)) {
    let prevRelease = ensureRelease(event.params.prevFundDeployer, event);
    prevRelease.current = false;
    prevRelease.close = event.block.timestamp.toI32();
    prevRelease.save();
  }
}

export function handleMigrationCancelled(event: MigrationCancelled): void {
  let migrationId = generateMigrationId(
    event.params.vaultProxy,
    event.params.prevFundDeployer,
    event.params.nextFundDeployer,
    event.params.executableTimestamp,
  );

  let migration = useMigration(migrationId);
  migration.cancelled = true;
  migration.cancelledTimestamp = event.block.timestamp.toI32();
  migration.save();

  let comptrollerProxy = ensureComptroller(Address.fromString(migration.comptroller), event);
  comptrollerProxy.vault = null;
  comptrollerProxy.status = 'FREE';
  comptrollerProxy.save();
}

export function handleMigrationExecuted(event: MigrationExecuted): void {
  let migrationId = generateMigrationId(
    event.params.vaultProxy,
    event.params.prevFundDeployer,
    event.params.nextFundDeployer,
    event.params.executableTimestamp,
  );

  let migration = useMigration(migrationId);
  migration.executed = true;
  migration.executedTimestamp = event.block.timestamp.toI32();
  migration.save();

  let vault = useVault(event.params.vaultProxy.toHex());
  let prevAccessor = vault.comptroller;
  vault.release = ensureRelease(event.params.nextFundDeployer, event).id;
  vault.comptroller = ensureComptroller(Address.fromString(migration.comptroller), event).id;
  vault.save();

  trackVaultMetric(event.params.vaultProxy, event);

  // start monitoring the Comptroller Proxy
  let comptrollerContext = new DataSourceContext();
  comptrollerContext.setString('vaultProxy', event.params.vaultProxy.toHex());

  if (event.params.nextFundDeployer.equals(release3Addresses.fundDeployerAddress)) {
    ComptrollerLib3DataSource.createWithContext(event.params.nextVaultAccessor, comptrollerContext);
  }

  if (event.params.nextFundDeployer.equals(release4Addresses.fundDeployerAddress)) {
    ComptrollerLib4DataSource.createWithContext(event.params.nextVaultAccessor, comptrollerContext);
  }

  let comptrollerProxy = ensureComptroller(Address.fromString(migration.comptroller), event);
  comptrollerProxy.activation = event.block.timestamp.toI32();
  comptrollerProxy.status = 'COMMITTED';
  comptrollerProxy.save();

  let prevComptrollerProxy = ensureComptroller(Address.fromString(prevAccessor), event);
  prevComptrollerProxy.destruction = event.block.timestamp.toI32();
  prevComptrollerProxy.status = 'DESTRUCTED';
  prevComptrollerProxy.save();
}

export function handleMigrationSignaled(event: MigrationSignaled): void {
  let migrationId = generateMigrationId(
    event.params.vaultProxy,
    event.params.prevFundDeployer,
    event.params.nextFundDeployer,
    event.params.executableTimestamp,
  );

  let migration = new Migration(migrationId);
  migration.vault = useVault(event.params.vaultProxy.toHex()).id;
  migration.comptroller = ensureComptroller(event.params.nextVaultAccessor, event).id;
  migration.prevRelease = ensureRelease(event.params.prevFundDeployer, event).id;
  migration.nextRelease = ensureRelease(event.params.nextFundDeployer, event).id;
  migration.executableTimestamp = event.params.executableTimestamp.toI32();
  migration.cancelled = false;
  migration.executed = false;
  migration.save();

  let vault = useVault(event.params.vaultProxy.toHex());

  let comptrollerProxy = ensureComptroller(event.params.nextVaultAccessor, event);
  comptrollerProxy.vault = vault.id;
  comptrollerProxy.status = 'SIGNALLED';
  comptrollerProxy.save();
}

export function handleMigrationTimelockSet(event: MigrationTimelockSet): void {
  let network = ensureNetwork(event);
  network.migrationTimelock = event.params.nextTimelock.toI32();
  network.save();
}

export function handleSharesTokenSymbolSet(event: SharesTokenSymbolSet): void {
  let network = ensureNetwork(event);
  network.sharesTokenSymbol = event.params._nextSymbol;
  network.save();
}

export function handleNominatedOwnerRemoved(event: NominatedOwnerRemoved): void {
  let network = ensureNetwork(event);
  network.nominatedOwner = null;
  network.save();
}

export function handleNominatedOwnerSet(event: NominatedOwnerSet): void {
  let network = ensureNetwork(event);
  network.nominatedOwner = event.params.nominatedOwner;
  network.save();
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  let network = ensureNetwork(event);
  network.owner = event.params.nextOwner;
  network.nominatedOwner = null;
  network.save();
}

export function handleMigrationInCancelHookFailed(event: MigrationInCancelHookFailed): void {}
export function handleMigrationOutHookFailed(event: MigrationOutHookFailed): void {}
export function handleVaultProxyDeployed(event: VaultProxyDeployed): void {}
