import { dataSource } from '@graphprotocol/graph-ts';
import { Context } from '../context';
import { createEvent } from '../entities/Event';
import {
  AssetRemoval,
  AssetUpsert,
  EngineChange,
  ExchangeAdapterRemoval,
  ExchangeAdapterUpsert,
} from '../generated/RegistryContract';
import { ensureAsset } from '../entities/Asset';
import { arrayDiff } from '../utils/arrayDiff';
import { arrayUnique } from '../utils/arrayUnique';

export function handleAssetRemoval(event: AssetRemoval): void {
  let context = new Context(dataSource.context(), event);
  let asset = ensureAsset(event.params.asset, context);
  let version = context.entities.version;
  version.assets = arrayDiff<string>(version.assets, [asset.id]);
  version.save();

  createEvent('AssetRemoval', context);
}

export function handleAssetUpsert(event: AssetUpsert): void {
  let context = new Context(dataSource.context(), event);
  let asset = ensureAsset(event.params.asset, context);
  let version = context.entities.version;
  version.assets = arrayUnique<string>(version.assets.concat([asset.id]));
  version.save();

  createEvent('AssetUpsert', context);
}

export function handleEngineChange(event: EngineChange): void {
  let context = new Context(dataSource.context(), event);
  // TODO: Whatever we need to do here.
  createEvent('EngineChange', context);
}

export function handleExchangeAdapterRemoval(event: ExchangeAdapterRemoval): void {
  let context = new Context(dataSource.context(), event);
  // TODO: Remove exchange adapter.
  createEvent('ExchangeAdapterRemoval', context);
}

export function handleExchangeAdapterUpsert(event: ExchangeAdapterUpsert): void {
  let context = new Context(dataSource.context(), event);
  // TODO: Add exchange adapter.
  createEvent('ExchangeAdapterUpsert', context);
}
