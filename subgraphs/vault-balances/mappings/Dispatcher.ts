import { MigrationExecuted, VaultProxyDeployed } from '../generated/DispatcherContract';
import { Vault } from '../generated/schema';
import { VaultDataSource } from '../generated/templates';

export function handleVaultProxyDeployed(event: VaultProxyDeployed): void {
  let id = event.params.vaultProxy.toHex();

  // This should never happen but it doesn't hurt to check it nonetheless.
  if (Vault.load(id) != null) {
    return;
  }

  let vault = new Vault(id);
  vault.updated = event.block.timestamp.toI32();
  vault.version = event.params.fundDeployer;
  vault.portfolio = [];
  vault.save();

  // Spawn the data source for the vault proxy to observe tracked assets and external positions.
  VaultDataSource.create(event.params.vaultProxy);
}

export function handleMigrationExecuted(event: MigrationExecuted): void {
  let vault = Vault.load(event.params.vaultProxy.toHex()) as Vault;

  // This should never happen but it doesn't hurt to check it nonetheless.
  if (vault == null) {
    return;
  }

  vault.updated = event.block.timestamp.toI32();
  vault.version = event.params.nextFundDeployer;
  vault.save();
}
