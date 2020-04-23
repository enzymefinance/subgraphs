import { dataSource, Address, Value } from '@graphprotocol/graph-ts';
import { trackVersionEvent } from '../entities/Event';
import {
  AssetRemoval,
  AssetUpsert,
  EfxWrapperRegistryChange,
  EngineChange,
  ExchangeAdapterRemoval,
  ExchangeAdapterUpsert,
  IncentiveChange,
  LogSetAuthority,
  LogSetOwner,
  MGMChange,
  MlnTokenChange,
  NativeAssetChange,
  PriceSourceChange,
} from '../generated/templates/v2/RegistryContract/RegistryContract';

let context = dataSource.context();
let version = Address.fromString((context.get('version') as Value).toString());

export function handleAssetRemoval(event: AssetRemoval): void {
  trackVersionEvent('AssetRemoval', event, version);
}

export function handleAssetUpsert(event: AssetUpsert): void {
  trackVersionEvent('AssetUpsert', event, version);
}

export function handleEfxWrapperRegistryChange(event: EfxWrapperRegistryChange): void {
  trackVersionEvent('EfxWrapperRegistryChange', event, version);
}

export function handleEngineChange(event: EngineChange): void {
  trackVersionEvent('EngineChange', event, version);
}

export function handleExchangeAdapterRemoval(event: ExchangeAdapterRemoval): void {
  trackVersionEvent('ExchangeAdapterRemoval', event, version);
}

export function handleExchangeAdapterUpsert(event: ExchangeAdapterUpsert): void {
  trackVersionEvent('ExchangeAdapterUpsert', event, version);
}

export function handleIncentiveChange(event: IncentiveChange): void {
  trackVersionEvent('IncentiveChange', event, version);
}

export function handleLogSetAuthority(event: LogSetAuthority): void {
  // trackVersionEvent('LogSetAuthority', event, version);
}

export function handleLogSetOwner(event: LogSetOwner): void {
  // trackVersionEvent('LogSetOwner', event, version);
}

export function handleMGMChange(event: MGMChange): void {
  trackVersionEvent('MGMChange', event, version);
}

export function handleMlnTokenChange(event: MlnTokenChange): void {
  trackVersionEvent('MlnTokenChange', event, version);
}

export function handleNativeAssetChange(event: NativeAssetChange): void {
  trackVersionEvent('NativeAssetChange', event, version);
}

export function handlePriceSourceChange(event: PriceSourceChange): void {
  trackVersionEvent('PriceSourceChange', event, version);
}
