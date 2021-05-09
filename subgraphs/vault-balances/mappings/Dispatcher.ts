import { VaultProxyDeployed } from '../generated/DispatcherContract';
import { Vault } from '../generated/schema';

export function handleVaultProxyDeployed(event: VaultProxyDeployed): void {
  let id = event.params.vaultProxy.toHex();
  let vault = new Vault(id);
  vault.save();
}
