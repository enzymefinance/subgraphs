import { Address, DataSourceContext } from '@graphprotocol/graph-ts';
import { Asset, ChainlinkAggregator } from '../generated/schema';
import { ChainlinkAggregatorDataSource } from '../generated/templates';
import { logCritical } from '../utils/logCritical';

export function useChainlinkAggregator(id: string): ChainlinkAggregator {
  let aggregator = ChainlinkAggregator.load(id) as ChainlinkAggregator;
  if (aggregator == null) {
    logCritical('Failed to load chainlink aggregator {}.', [id]);
  }

  return aggregator;
}

export function chainlinkAssetAggregatorId(aggregatorAddress: string, assetId: string): string {
  return aggregatorAddress + '/asset/' + assetId;
}

export function chainlinkEthUsdAggregatorId(aggregatorAddress: string): string {
  return aggregatorAddress + '/ethusd';
}

function enableChainlinkAggregator(address: Address, id: string, type: string, asset?: Asset): ChainlinkAggregator {
  let aggregator = ChainlinkAggregator.load(id) as ChainlinkAggregator;

  if (!aggregator) {
    aggregator = new ChainlinkAggregator(id);
    aggregator.type = type;
    aggregator.asset = asset != null ? asset.id : null;
    aggregator.active = true;
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

export function enableChainlinkAssetAggregator(address: Address, asset: Asset): ChainlinkAggregator {
  let id = chainlinkAssetAggregatorId(address.toHex(), asset.id);
  return enableChainlinkAggregator(address, id, 'ASSET', asset);
}

export function enableChainlinkEthUsdAggregator(address: Address): ChainlinkAggregator {
  let id = chainlinkEthUsdAggregatorId(address.toHex());
  return enableChainlinkAggregator(address, id, 'ETHUSD');
}

export function disableChainlinkAssetAggregator(address: Address, asset: Asset): ChainlinkAggregator {
  let id = chainlinkAssetAggregatorId(address.toHex(), asset.id);
  let aggregator = useChainlinkAggregator(id);

  if (aggregator.active) {
    aggregator.active = false;
    aggregator.save();
  }

  return aggregator;
}

export function disableChainlinkEthUsdAggregator(address: Address): ChainlinkAggregator {
  let id = chainlinkEthUsdAggregatorId(address.toHex());
  let aggregator = useChainlinkAggregator(id);

  if (aggregator.active) {
    aggregator.active = false;
    aggregator.save();
  }

  return aggregator;
}
