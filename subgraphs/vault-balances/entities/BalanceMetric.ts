import { Address, ethereum } from '@graphprotocol/graph-ts';
import { Asset, Balance, BalanceMetric, Vault } from '../generated/schema';
import { getBalanceMetricCounter } from './Counter';

export function balanceMetricId(vault: Vault, asset: Asset, event: ethereum.Event): string {
  return vault.id + '/' + asset.id + '/' + event.block.number.toString();
}

export function recordBalanceMetric(vault: Vault, asset: Asset, balance: Balance, event: ethereum.Event): void {
  let id = balanceMetricId(vault, asset, event);
  let metric = BalanceMetric.load(id);
  if (metric == null) {
    metric = new BalanceMetric(id);
    metric.counter = getBalanceMetricCounter();
    metric.timestamp = event.block.timestamp.toI32();
    metric.block = event.block.number;
    metric.vault = Address.fromString(vault.id);
    metric.asset = Address.fromString(asset.id);
  }

  metric.tracked = balance.tracked;
  metric.balance = balance.balance;
  metric.save();
}
