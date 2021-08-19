import { Address } from '@graphprotocol/graph-ts';
import { AggregatorProxyContract } from '../generated/AggregatorProxyContract';
import { AggregatorProxy, Aggregator } from '../generated/schema';
import { ChainlinkAggregatorDataSource } from '../generated/templates';

export function getOrCreateAggregatorProxy(proxyAddress: Address): AggregatorProxy {
  let proxy = AggregatorProxy.load(proxyAddress.toHex()) as AggregatorProxy;

  if (proxy == null) {
    proxy = new AggregatorProxy(proxyAddress.toHex());
    proxy.registrations = [];
    proxy.save();
  }

  return proxy;
}

export function getOrCreateAggregator(aggregatorAddress: Address): Aggregator {
  let aggregator = Aggregator.load(aggregatorAddress.toHex()) as Aggregator;

  if (aggregator == null) {
    let contract = AggregatorProxyContract.bind(aggregatorAddress);
    let result = contract.try_decimals();

    aggregator = new Aggregator(aggregatorAddress.toHex());
    aggregator.decimals = result.reverted ? 18 : result.value;
    aggregator.proxies = [];
    aggregator.updated = 0;
    aggregator.save();

    // If the aggregator entity doesn't exist yet, we also need to spawn the data source.
    ChainlinkAggregatorDataSource.create(aggregatorAddress);
  }

  return aggregator;
}
