import { toBigDecimal } from '@enzymefinance/subgraph-utils';
import { Address, BigDecimal, ethereum } from '@graphprotocol/graph-ts';
import { Asset, Balance, Vault } from '../generated/schema';
import { tokenBalance } from '../utils/tokenCalls';
import { recordBalanceMetric } from './BalanceMetric';

export function getOrCreateVaultBalance(vault: Vault, asset: Asset): Balance {
  let id = vault.id + '/' + asset.id;
  let balance = Balance.load(id);

  if (balance == null) {
    balance = new Balance(id);
    balance.asset = asset.id;
    balance.vault = vault.id;
    balance.tracked = false;
    balance.balance = BigDecimal.fromString('0');
    balance.save();
  }

  return balance;
}

export function updateVaultBalance(vault: Vault, asset: Asset, event: ethereum.Event): Balance {
  let assetAddress = Address.fromString(asset.id);
  let vaultAddress = Address.fromString(vault.id);

  // Update the balance for this vault.
  let balance = getOrCreateVaultBalance(vault, asset);
  balance.balance = toBigDecimal(tokenBalance(assetAddress, vaultAddress), asset.decimals);
  balance.save();

  // Track metrics.
  recordBalanceMetric(vault, asset, balance, event);

  return balance;
}

export function updateTrackedAsset(vault: Vault, asset: Asset, event: ethereum.Event, tracked: boolean): void {
  let balance = getOrCreateVaultBalance(vault, asset);
  balance.tracked = tracked;
  balance.save();

  // NOTE: It's important that this is called last so that the call to `recordAumMetric` already uses
  // the updated `tracking` counter of the asset entity.
  updateVaultBalance(vault, asset, event);
}
