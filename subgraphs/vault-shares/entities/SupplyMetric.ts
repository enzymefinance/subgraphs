import { Address, ethereum } from '@graphprotocol/graph-ts';
import { SupplyMetric, Vault } from '../generated/schema';
import { getSupplyMetricCounter } from './Counter';

export function supplyMetricId(vault: Vault, event: ethereum.Event): string {
  return vault.id + '/' + event.block.number.toString();
}

export function recordSupplyMetric(vault: Vault, event: ethereum.Event): void {
  let id = supplyMetricId(vault, event);
  let metric = SupplyMetric.load(id);
  if (metric == null) {
    metric = new SupplyMetric(id);
    metric.counter = getSupplyMetricCounter();
    metric.timestamp = event.block.timestamp.toI32();
    metric.block = event.block.number.toI32();
    metric.vault = Address.fromString(vault.id);
  }

  metric.supply = vault.supply;
  metric.save();
}
