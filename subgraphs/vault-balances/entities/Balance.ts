import { toBigDecimal } from '@enzymefinance/subgraph-utils';
import { Address, BigDecimal, BigInt, ethereum } from '@graphprotocol/graph-ts';
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

  return balance as Balance;
}

export function updateVaultBalance(vault: Vault, asset: Asset, event: ethereum.Event): Balance {
  let balance = getOrCreateVaultBalance(vault, asset);

  // TODO: Is it reasonable to assume that we can default this to `0` if the balance cannot be fetched.
  let balanceOrNull = tokenBalance(Address.fromString(asset.id), Address.fromString(vault.id));
  let currentBalance = !balanceOrNull
    ? BigDecimal.fromString('0')
    : toBigDecimal(balanceOrNull as BigInt, asset.decimals);

  // Update the balance for this vault.
  balance.balance = currentBalance;
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
