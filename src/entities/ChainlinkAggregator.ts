import { Address } from '@graphprotocol/graph-ts';
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

function enableChainlinkAggregator(
  proxy: Address,
  address: Address,
  type: string,
  asset: Asset | null = null,
  currency: Currency | null = null,
): ChainlinkAggregator {
  let id = address.toHex();
  let aggregator = ChainlinkAggregator.load(id) as ChainlinkAggregator;

  if (!aggregator) {
    aggregator = new ChainlinkAggregator(id);
    aggregator.type = type;
    aggregator.proxy = proxy.toHex();
    aggregator.decimals = asset == null || asset.type == 'USD' ? 8 : 18;
    aggregator.asset = asset != null ? asset.id : null;
    aggregator.currency = currency != null ? currency.id : null;
    aggregator.active = true;
    aggregator.save();

    ChainlinkAggregatorDataSource.create(address);
  }

  if (!aggregator.active) {
    aggregator.active = true;
    aggregator.save();
  }

  return aggregator;
}

export function enableChainlinkAssetAggregator(proxy: Address, address: Address, asset: Asset): ChainlinkAggregator {
  return enableChainlinkAggregator(proxy, address, 'ASSET', asset);
}

export function disableChainlinkAssetAggregator(address: Address): ChainlinkAggregator {
  let aggregator = useChainlinkAggregator(address.toHex());

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
  return enableChainlinkAggregator(proxy, address, 'ETHUSD', null, currency);
}

export function disableChainlinkEthUsdAggregator(address: Address): ChainlinkAggregator {
  let aggregator = useChainlinkAggregator(address.toHex());

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
  return enableChainlinkAggregator(proxy, address, 'CURRENCY', null, currency);
}

export function disableChainlinkCurrencyAggregator(address: Address): ChainlinkAggregator {
  let aggregator = useChainlinkAggregator(address.toHex());

  if (aggregator.active) {
    aggregator.active = false;
    aggregator.save();
  }

  return aggregator;
}
