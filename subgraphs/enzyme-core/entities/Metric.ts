import { Address, BigDecimal, ethereum } from '@graphprotocol/graph-ts';
import { BalanceOfMetric, MetricCounter, TotalSupplyMetric } from '../generated/schema';

export function getMetricCounter(): i32 {
  let counter = MetricCounter.load('metricId');

  if (counter == null) {
    counter = new MetricCounter('metricId');
    counter.counter = 1;
    counter.save();

    return counter.counter;
  }

  counter.counter = counter.counter + 1;
  counter.save();

  return counter.counter;
}

export function trackBalanceOfMetric(
  vaultAddress: Address,
  depositorAddress: Address,
  balanceOf: BigDecimal,
  event: ethereum.Event,
): void {
  let id = vaultAddress.toHex() + '/' + depositorAddress.toHex() + '/' + event.block.timestamp.toString();

  let metric = BalanceOfMetric.load(id);

  if (metric != null) {
    return;
  }

  metric = new BalanceOfMetric(id);
  metric.counter = getMetricCounter();
  metric.timestamp = event.block.timestamp.toI32();
  metric.type = 'balanceOf';
  metric.vault = vaultAddress;
  metric.depositor = depositorAddress;
  metric.balance = balanceOf;
  metric.save();
}

export function trackTotalSupplyMetric(vaultAddress: Address, totalSupply: BigDecimal, event: ethereum.Event): void {
  let id = vaultAddress.toHex() + '/' + event.block.timestamp.toString();

  let metric = TotalSupplyMetric.load(id);

  if (metric != null) {
    return;
  }

  metric = new TotalSupplyMetric(id);
  metric.counter = getMetricCounter();
  metric.timestamp = event.block.timestamp.toI32();
  metric.type = 'totalSupply';
  metric.vault = vaultAddress;
  metric.totalSupply = totalSupply;
  metric.save();
}
