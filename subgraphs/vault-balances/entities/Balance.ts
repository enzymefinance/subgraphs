import { BigDecimal, Address, BigInt, ethereum } from '@graphprotocol/graph-ts';
import { toBigDecimal, arrayDiff } from '@enzymefinance/subgraph-utils';
import { Vault, Asset, Balance } from '../generated/schema';
import { tokenBalance } from '../utils/tokenCalls';

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

function maintainPortfolio(vault: Vault, balance: Balance): void {
  // Bail out early if the balance entity is already registered in the current portfolio.
  let included = vault.portfolio.includes(balance.id);
  if (balance.tracked && !included) {
    vault.portfolio = vault.portfolio.concat([balance.id]);
  } else if (!balance.tracked && included) {
    vault.portfolio = arrayDiff<string>(vault.portfolio, [balance.id]);
  }

  vault.updated = balance.updated;
  vault.save();
}

export class UpdateVaultBalanceTuple {
  balance: Balance;
  tvl: BigDecimal;

  constructor(balance: Balance, tvl: BigDecimal) {
    this.balance = balance;
    this.tvl = tvl;
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

  // Update the tvl for this asset.
  asset.tvl = asset.tvl.minus(previousBalance).plus(currentBalance);
  asset.save();

  // Update the balance for this vault.
  balance.balance = currentBalance;
  balance.updated = event.block.number.toI32();
  balance.save();

  // Create a historical snapshot of the balance entity.
  maintainPortfolio(vault, balance);

  return new UpdateVaultBalanceTuple(balance, asset.tvl);
}

export function updateTrackedAsset(vault: Vault, asset: Asset, event: ethereum.Event, tracked: boolean): void {
  let balance = getOrCreateVaultBalance(vault, asset, event);
  balance.tracked = tracked;
  balance.save();

  // Create a historical snapshot of the balance entity.
  maintainPortfolio(vault, balance);
}
