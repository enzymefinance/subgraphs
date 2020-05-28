import { dataSource, DataSourceTemplate, Address } from '@graphprotocol/graph-ts';
import { Context } from '../context';
import { createContractEvent } from '../entities/Event';
import {
  AssetRemoval,
  AssetUpsert,
  EngineChange,
  ExchangeAdapterRemoval,
  ExchangeAdapterUpsert,
  PriceSourceChange,
} from '../generated/RegistryContract';
import { ensureAsset } from '../entities/Asset';
import { arrayDiff } from '../utils/arrayDiff';
import { arrayUnique } from '../utils/arrayUnique';
import { ensureExchange } from '../entities/Exchange';
import { ensurePriceSource } from '../entities/PriceUpdate';

export function handleAssetRemoval(event: AssetRemoval): void {
  let context = new Context(dataSource.context(), event);
  let asset = ensureAsset(event.params.asset, context);
  let version = context.entities.version;
  version.assets = arrayDiff<string>(version.assets, [asset.id]);
  version.save();

  createContractEvent('AssetRemoval', context);
}

export function handleAssetUpsert(event: AssetUpsert): void {
  let context = new Context(dataSource.context(), event);
  let asset = ensureAsset(event.params.asset, context);
  let version = context.entities.version;
  version.assets = arrayUnique<string>(version.assets.concat([asset.id]));
  version.save();

  createContractEvent('AssetUpsert', context);
}

export function handleEngineChange(event: EngineChange): void {
  let context = new Context(dataSource.context(), event);
  // TODO: Whatever we need to do here.
  createContractEvent('EngineChange', context);
}

export function handleExchangeAdapterRemoval(event: ExchangeAdapterRemoval): void {
  let context = new Context(dataSource.context(), event);

  // TODO: Should we track adapters or exchanges in the subgraph?
  let exchange = ensureExchange(event.params.exchange, context);
  let version = context.entities.version;
  version.exchanges = arrayDiff<string>(version.exchanges, [exchange.id]);
  version.save();

  createContractEvent('ExchangeAdapterRemoval', context);
}

export function handleExchangeAdapterUpsert(event: ExchangeAdapterUpsert): void {
  let context = new Context(dataSource.context(), event);

  // TODO: Should we track adapters or exchanges in the subgraph?
  let exchange = ensureExchange(event.params.exchange, context);
  let version = context.entities.version;
  version.exchanges = arrayUnique<string>(version.exchanges.concat([exchange.id]));
  version.save();

  createContractEvent('ExchangeAdapterUpsert', context);
}

export function handlePriceSourceChange(event: PriceSourceChange): void {
  let context = new Context(dataSource.context(), event);

  let priceSource = ensurePriceSource(event.params.priceSource, context);

  DataSourceTemplate.createWithContext('PriceSourceContract', [priceSource.id], context.context);
}
