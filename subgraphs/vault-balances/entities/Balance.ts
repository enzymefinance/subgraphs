import { arrayDiff, toBigDecimal, ZERO_BD } from '@enzymefinance/subgraph-utils';
import { Address, BigDecimal, BigInt, ethereum } from '@graphprotocol/graph-ts';
import { Asset, Balance, Vault } from '../generated/schema';
import { tokenBalance } from '../utils/tokenCalls';
import { recordAumMetric } from './AumMetric';
import { recordBalanceMetric } from './BalanceMetric';

export function getOrCreateVaultBalance(vault: Vault, asset: Asset, event: ethereum.Event): Balance {
  let id = vault.id + '/' + asset.id;
  let balance = Balance.load(id);

  if (balance == null) {
    balance = new Balance(id);
    balance.asset = asset.id;
    balance.vault = vault.id;
    balance.tracked = false;
    balance.updated = event.block.number.toI32();
    balance.balance = BigDecimal.fromString('0');
    balance.save();
  }

  return balance as Balance;
}

export class UpdateVaultBalanceTuple {
  balance: Balance;
  aum: BigDecimal;

  constructor(balance: Balance, aum: BigDecimal) {
    this.balance = balance;
    this.aum = aum;
  }
}

export function updateVaultBalance(vault: Vault, asset: Asset, event: ethereum.Event): UpdateVaultBalanceTuple {
  let balance = getOrCreateVaultBalance(vault, asset, event);
  let previousBalance = balance.balance;

  // TODO: Is it reasonable to assume that we can default this to `0` if the balance cannot be fetched.
  let balanceOrNull = tokenBalance(Address.fromString(asset.id), Address.fromString(vault.id));
  let currentBalance = !balanceOrNull
    ? BigDecimal.fromString('0')
    : toBigDecimal(balanceOrNull as BigInt, asset.decimals);

  // Update the holding counter on the asset entity.
  if (previousBalance.equals(ZERO_BD) && !currentBalance.equals(ZERO_BD)) {
    asset.holding = asset.holding + 1;
  } else if (!previousBalance.equals(ZERO_BD) && currentBalance.equals(ZERO_BD)) {
    asset.holding = asset.holding - 1;
  }

  // Update the aum for this asset.
  asset.aum = asset.aum.minus(previousBalance).plus(currentBalance);
  asset.save();

  // Update the balance for this vault.
  balance.balance = currentBalance;
  balance.updated = event.block.number.toI32();
  balance.save();

  // Record the timestamp of the last change.
  vault.updated = balance.updated;
  vault.save();

  // Track metrics.
  recordBalanceMetric(vault, asset, balance, event);
  recordAumMetric(asset, event);

  return new UpdateVaultBalanceTuple(balance, asset.aum);
}

export function updateTrackedAsset(vault: Vault, asset: Asset, event: ethereum.Event, tracked: boolean): void {
  let balance = getOrCreateVaultBalance(vault, asset, event);

  // Update the tracking counter on the asset entity.
  if (!balance.tracked && tracked) {
    asset.tracking = asset.tracking + 1;
    asset.save();
  } else if (balance.tracked && !tracked) {
    asset.tracking = asset.tracking - 1;
    asset.save();
  }

  balance.tracked = tracked;
  balance.save();

  // Update the portfolio.
  // Bail out early if the balance entity is already registered in the current portfolio.
  let included = vault.portfolio.includes(balance.id);
  if (balance.tracked && !included) {
    vault.portfolio = vault.portfolio.concat([balance.id]);
  } else if (!balance.tracked && included) {
    vault.portfolio = arrayDiff<string>(vault.portfolio, [balance.id]);
  }

  // NOTE: It's important that this is called last so that the call to `recordAumMetric` already uses
  // the updated `tracking` counter of the asset entity.
  updateVaultBalance(vault, asset, event);
}
