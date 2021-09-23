import { ZERO_BI } from '@enzymefinance/subgraph-utils';
import { Address, ethereum } from '@graphprotocol/graph-ts';
import { SharedSdk } from '../generated/contracts/SharedSdk';
import { AggregatorProxy, Aggregator } from '../generated/schema';
import { ChainlinkAggregatorDataSource } from '../generated/templates';

export function getOrCreateAggregatorProxy(proxyAddress: Address): AggregatorProxy {
  let proxy = AggregatorProxy.load(proxyAddress.toHex());

  if (proxy == null) {
    proxy = new AggregatorProxy(proxyAddress.toHex());
    proxy.registrations = [];
    proxy.save();
  }

  return proxy;
}

export function getOrCreateAggregator(aggregatorAddress: Address, event: ethereum.Event): Aggregator {
  let aggregator = Aggregator.load(aggregatorAddress.toHex());

  if (aggregator == null) {
    let contract = SharedSdk.bind(aggregatorAddress);
    let decimals = contract.try_decimals();
    let timestamp = contract.try_latestTimestamp();
    let answer = contract.try_latestAnswer();

    aggregator = new Aggregator(aggregatorAddress.toHex());
    aggregator.decimals = decimals.reverted ? 18 : decimals.value;
    aggregator.proxies = [];
    aggregator.answer = answer.reverted ? ZERO_BI : answer.value;
    aggregator.timestamp = timestamp.reverted ? 0 : timestamp.value.toI32();
    aggregator.updated = event.block.timestamp.toI32();
    aggregator.save();

    // If the aggregator entity doesn't exist yet, we also need to spawn the data source.
    ChainlinkAggregatorDataSource.create(aggregatorAddress);
  }

  return aggregator;
}
