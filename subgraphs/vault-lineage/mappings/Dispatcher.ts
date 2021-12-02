import { getOrCreateVault } from '../entities/Vault';
import { getOrCreateRelease } from '../entities/Release';
import { getOrCreateComptroller } from '../entities/Comptroller';
import { CurrentFundDeployerSet, MigrationExecuted, VaultProxyDeployed } from '../generated/contracts/DispatcherEvents';
import { Comptroller, Vault } from '../generated/schema';

export function handleCurrentFundDeployerSet(event: CurrentFundDeployerSet): void {
  getOrCreateRelease(event.params.nextFundDeployer);
}

export function handleVaultProxyDeployed(event: VaultProxyDeployed): void {
  let id = event.params.vaultProxy.toHex();
  // This should never happen but it doesn't hurt to check it nonetheless.
  if (Vault.load(id) != null) {
    return;
  }

  let vault = getOrCreateVault(event.params.vaultProxy, event);
  let release = getOrCreateRelease(event.params.fundDeployer);
  let comptroller = getOrCreateComptroller(event.params.vaultAccessor, vault, release, event);
  vault.creator = event.params.owner.toHex();
  vault.name = event.params.fundName;
  vault.comptroller = comptroller.id;
  vault.release = release.id;
  vault.save();
}

export function handleMigrationExecuted(event: MigrationExecuted): void {
  let vault = getOrCreateVault(event.params.vaultProxy, event);

  // Mark the previous comptroller as destroyed.
  let previous = Comptroller.load(vault.comptroller);
  if (previous != null) {
    previous.to = event.block.number.toI32() - 1;
    previous.save();
  }

  // Create the new comptroller and associate it with the vault.
  let release = getOrCreateRelease(event.params.nextFundDeployer);
  let comptroller = getOrCreateComptroller(event.params.nextVaultAccessor, vault, release, event);
  vault.comptroller = comptroller.id;
  vault.release = release.id;
  vault.save();
}
