import { Address, DataSourceContext } from '@graphprotocol/graph-ts';
import { Asset, ChainlinkAggregatorProxy, Currency } from '../generated/schema';
import { ChainlinkAggregatorDataSource } from '../generated/templates';
import { arrayUnique } from '../utils/arrayUnique';
import { ensureCron } from '../utils/cronManager';
import { logCritical } from '../utils/logCritical';

export function useChainlinkAggregatorProxy(id: string): ChainlinkAggregatorProxy {
  let aggregator = ChainlinkAggregatorProxy.load(id) as ChainlinkAggregatorProxy;
  if (aggregator == null) {
    logCritical('Failed to load chainlink aggregator {}.', [id]);
  }

  return aggregator;
}

function ensureChainlinkAggregatorProxy(
  proxyAddress: Address,
  aggregatorAddress: Address,
  type: string,
  asset: Asset | null = null,
  currency: Currency | null = null,
): ChainlinkAggregatorProxy {
  let id = proxyAddress.toHex();
  let proxy = ChainlinkAggregatorProxy.load(id) as ChainlinkAggregatorProxy;

  // new proxy
  if (!proxy) {
    proxy = new ChainlinkAggregatorProxy(id);
    proxy.type = type;
    proxy.aggregator = aggregatorAddress.toHex();
    proxy.decimals = asset == null || asset.type == 'USD' ? 8 : 18;
    proxy.asset = asset != null ? asset.id : null;
    proxy.currency = currency != null ? currency.id : null;
    proxy.save();

    let context = new DataSourceContext();
    context.setString('proxy', id);
    ChainlinkAggregatorDataSource.createWithContext(aggregatorAddress, context);

    let cron = ensureCron();
    cron.chainlinkAggregatorProxies = arrayUnique<string>(cron.chainlinkAggregatorProxies.concat([proxy.id]));
    cron.save();
  }

  // proxy exists, aggregator changed
  if (proxy.aggregator != aggregatorAddress.toHex()) {
    proxy.aggregator = aggregatorAddress.toHex();
    proxy.save();

    let context = new DataSourceContext();
    context.setString('proxy', id);
    ChainlinkAggregatorDataSource.createWithContext(aggregatorAddress, context);
  }

  return proxy;
}

export function ensureChainlinkAssetAggregatorProxy(
  proxy: Address,
  aggregator: Address,
  asset: Asset,
): ChainlinkAggregatorProxy {
  return ensureChainlinkAggregatorProxy(proxy, aggregator, 'ASSET', asset);
}

export function ensureChainlinkEthUsdAggregatorProxy(
  proxy: Address,
  aggregator: Address,
  currency: Currency,
): ChainlinkAggregatorProxy {
  return ensureChainlinkAggregatorProxy(proxy, aggregator, 'ETHUSD', null, currency);
}

export function ensureChainlinkCurrencyAggregatorProxy(
  proxy: Address,
  aggregator: Address,
  currency: Currency,
): ChainlinkAggregatorProxy {
  return ensureChainlinkAggregatorProxy(proxy, aggregator, 'CURRENCY', null, currency);
}
