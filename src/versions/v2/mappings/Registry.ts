import { dataSource, Address, Value } from '@graphprotocol/graph-ts';
import { Event, Fund, Version } from '../generated/schema';
import { trackVersionEvent } from '../entities/Event';
import { updateVersion, ensureVersion } from '../entities/Version';
import {
  AssetRemoval,
  AssetUpsert,
  EngineChange,
  ExchangeAdapterRemoval,
  ExchangeAdapterUpsert,
} from '../generated/v2/VersionContract/RegistryContract';

let context = dataSource.context();
let version = ensureVersion(Address.fromString((context.get('version') as Value).toString()));

export function handleAssetRemoval(event: AssetRemoval): void {
  updateVersion(version);
  trackVersionEvent('AssetRemoval', event, version);
}

export function handleAssetUpsert(event: AssetUpsert): void {
  updateVersion(version);
  trackVersionEvent('AssetUpsert', event, version);
}

export function handleEngineChange(event: EngineChange): void {
  trackVersionEvent('EngineChange', event, version);
}

export function handleExchangeAdapterRemoval(event: ExchangeAdapterRemoval): void {
  updateVersion(version);
  trackVersionEvent('ExchangeAdapterRemoval', event, version);
}

export function handleExchangeAdapterUpsert(event: ExchangeAdapterUpsert): void {
  updateVersion(version);
  trackVersionEvent('ExchangeAdapterUpsert', event, version);
}
