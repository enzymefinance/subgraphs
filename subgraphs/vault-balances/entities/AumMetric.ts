import { Address, ethereum } from '@graphprotocol/graph-ts';
import { Asset, AumMetric } from '../generated/schema';
import { getAumMetricCounter } from './Counter';

export function aumMetricId(asset: Asset, event: ethereum.Event): string {
  return asset.id + '/' + event.block.number.toString();
}

export function recordAumMetric(asset: Asset, event: ethereum.Event): void {
  let id = aumMetricId(asset, event);
  let metric = AumMetric.load(id);
  if (metric == null) {
    metric = new AumMetric(id);
    metric.asset = Address.fromString(asset.id);
    metric.counter = getAumMetricCounter();
    metric.timestamp = event.block.timestamp.toI32();
    metric.block = event.block.number.toI32();
  }

  metric.aum = asset.aum;
  metric.tracking = asset.tracking;
  metric.holding = asset.holding;
  metric.save();
}
