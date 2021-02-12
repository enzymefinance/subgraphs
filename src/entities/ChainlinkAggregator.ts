import { Address, DataSourceContext } from '@graphprotocol/graph-ts';
import { Asset, ChainlinkAggregator, Currency } from '../generated/schema';
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

export function chainlinkCurrencyAggregatorId(aggregatorAddress: string, identifier: string): string {
  return aggregatorAddress + '/currency/' + identifier;
}

function enableChainlinkAggregator(
  proxy: Address,
  address: Address,
  id: string,
  type: string,
  asset: Asset | null = null,
  currency: Currency | null = null,
): ChainlinkAggregator {
  let aggregator = ChainlinkAggregator.load(id) as ChainlinkAggregator;

  if (!aggregator) {
    aggregator = new ChainlinkAggregator(id);
    aggregator.type = type;
    aggregator.asset = asset != null ? asset.id : null;
    aggregator.currency = currency != null ? currency.id : null;
    aggregator.active = true;
    aggregator.save();

    let context = new DataSourceContext();
    context.setString('aggregator', id);
    context.setString('proxy', proxy.toHex());
    context.setI32('decimals', asset == null || asset.type == 'USD' ? 8 : 18);
    ChainlinkAggregatorDataSource.createWithContext(address, context);
  }

  if (!aggregator.active) {
    aggregator.active = true;
    aggregator.save();
  }

  return aggregator;
}

export function enableChainlinkAssetAggregator(proxy: Address, address: Address, asset: Asset): ChainlinkAggregator {
  let id = chainlinkAssetAggregatorId(address.toHex(), asset.id);
  return enableChainlinkAggregator(proxy, address, id, 'ASSET', asset);
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

export function enableChainlinkEthUsdAggregator(
  proxy: Address,
  address: Address,
  currency: Currency,
): ChainlinkAggregator {
  let id = chainlinkEthUsdAggregatorId(address.toHex());
  return enableChainlinkAggregator(proxy, address, id, 'ETHUSD', null, currency);
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

export function enableChainlinkCurrencyAggregator(
  proxy: Address,
  address: Address,
  currency: Currency,
): ChainlinkAggregator {
  let id = chainlinkCurrencyAggregatorId(address.toHex(), currency.id);
  return enableChainlinkAggregator(proxy, address, id, 'CURRENCY', null, currency);
}

export function disableChainlinkCurrencyAggregator(address: Address, currency: Currency): ChainlinkAggregator {
  let id = chainlinkCurrencyAggregatorId(address.toHex(), currency.id);
  let aggregator = useChainlinkAggregator(id);

  if (aggregator.active) {
    aggregator.active = false;
    aggregator.save();
  }

  return aggregator;
}
