import { Address, dataSource } from '@graphprotocol/graph-ts';
import { Event, Fund, Version } from '../generated/schema';
import { Context } from '../context';
import { createEvent } from '../entities/Event';
import {
  AssetRemoval,
  AssetUpsert,
  EngineChange,
  ExchangeAdapterRemoval,
  ExchangeAdapterUpsert,
} from '../generated/RegistryContract';

export function handleAssetRemoval(event: AssetRemoval): void {
  let context = new Context(dataSource.context(), event);
  // TODO: Remove asset from version.
  createEvent('AssetRemoval', context);
}

export function handleAssetUpsert(event: AssetUpsert): void {
  let context = new Context(dataSource.context(), event);
  // TODO: Add asset to version.
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
