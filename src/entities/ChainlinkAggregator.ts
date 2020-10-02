import { Address, DataSourceContext } from '@graphprotocol/graph-ts';
import { ChainlinkAggregatorContract } from '../generated/ChainlinkAggregatorContract';
import { Asset, ChainlinkAggregator } from '../generated/schema';
import { ChainlinkAggregatorDataSource } from '../generated/templates';
import { logCritical } from '../utils/logCritical';
import { trackAssetPrice } from './AssetPrice';

export function chainlinkAggregatorId(aggregatorAddress: string, assetId: string): string {
  return aggregatorAddress + '/' + assetId;
}

export function useChainlinkAggregator(id: string): ChainlinkAggregator {
  let aggregator = ChainlinkAggregator.load(id) as ChainlinkAggregator;
  if (aggregator == null) {
    logCritical('Failed to load chainlink aggregator {}.', [id]);
  }

  return aggregator;
}

export function enableChainlinkAggregator(address: Address, asset: Asset): ChainlinkAggregator {
  let id = chainlinkAggregatorId(address.toHex(), asset.id);
  let aggregator = ChainlinkAggregator.load(id) as ChainlinkAggregator;

  if (!aggregator) {
    aggregator = new ChainlinkAggregator(id);
    aggregator.asset = asset.id;
    aggregator.active = false;
    aggregator.save();

    let context = new DataSourceContext();
    context.setString('aggregator', id);
    ChainlinkAggregatorDataSource.createWithContext(address, context);
  }

  if (!aggregator.active) {
    aggregator.active = true;
    aggregator.save();
  }

  return aggregator;
}

export function disableChainlinkAggregator(address: Address, asset: Asset): ChainlinkAggregator {
  let aggregator = useChainlinkAggregator(chainlinkAggregatorId(address.toHex(), asset.id));

  if (aggregator.active) {
    aggregator.active = false;
    aggregator.save();
  }

  return aggregator;
}
