import { Address } from '@graphprotocol/graph-ts';
import { Event, Fund, Version } from '../generated/schema';
import { Context, context } from '../context';
import { createEvent } from '../entities/Event';
import {
  AssetRemoval,
  AssetUpsert,
  EngineChange,
  ExchangeAdapterRemoval,
  ExchangeAdapterUpsert,
} from '../generated/RegistryContract';

export function handleAssetRemoval(event: AssetRemoval): void {
  // TODO: Remove asset from version.
  createEvent('AssetRemoval', event, context);
}

export function handleAssetUpsert(event: AssetUpsert): void {
  // TODO: Add asset to version.
  createEvent('AssetUpsert', event, context);
}

export function handleEngineChange(event: EngineChange): void {
  // TODO: Whatever we need to do here.
  createEvent('EngineChange', event, context);
}

export function handleExchangeAdapterRemoval(event: ExchangeAdapterRemoval): void {
  // TODO: Remove exchange adapter.
  createEvent('ExchangeAdapterRemoval', event, context);
}

export function handleExchangeAdapterUpsert(event: ExchangeAdapterUpsert): void {
  // TODO: Add exchange adapter.
  createEvent('ExchangeAdapterUpsert', event, context);
}
