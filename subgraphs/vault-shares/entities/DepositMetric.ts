import { Address, ethereum } from '@graphprotocol/graph-ts';
import { DepositMetric, Deposit, Vault, Depositor } from '../generated/schema';
import { getDepositMetricCounter } from './Counter';

export function depositMetricId(vault: Vault, depositor: Depositor, event: ethereum.Event): string {
  return vault.id + '/' + depositor.id + '/' + event.block.number.toString();
}

export function recordDepositMetric(vault: Vault, depositor: Depositor, deposit: Deposit, event: ethereum.Event): void {
  let id = depositMetricId(vault, depositor, event);
  let metric = DepositMetric.load(id);
  if (metric == null) {
    metric = new DepositMetric(id);
    metric.counter = getDepositMetricCounter();
    metric.timestamp = event.block.timestamp.toI32();
    metric.block = event.block.number;
    metric.vault = Address.fromString(vault.id);
    metric.depositor = Address.fromString(depositor.id);
  }

  metric.shares = deposit.shares;
  metric.save();
}
