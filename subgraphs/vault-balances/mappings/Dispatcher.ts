import { VaultProxyDeployed } from '../generated/contracts/DispatcherEvents';
import { Vault } from '../generated/schema';
import { VaultDataSource } from '../generated/templates';

export function handleVaultProxyDeployed(event: VaultProxyDeployed): void {
  let id = event.params.vaultProxy.toHex();

  // This should never happen but it doesn't hurt to check it nonetheless.
  if (Vault.load(id) != null) {
    return;
  }

  let vault = new Vault(id);
  vault.save();

  // Spawn the data source for the vault proxy to observe tracked assets and external positions.
  VaultDataSource.create(event.params.vaultProxy);
}
