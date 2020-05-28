import { Address, DataSourceTemplate } from '@graphprotocol/graph-ts';
import { Version } from '../generated/schema';
import { Context } from '../context';
import { logCritical } from '../utils/logCritical';
import { ensureAssets } from './Asset';
import { ensureExchanges } from './Exchange';
import { ensurePriceSource } from './PriceUpdate';

export function useVersion(id: string): Version {
  let version = Version.load(id);
  if (version == null) {
    logCritical('Failed to load version {}.', [id]);
  }

  return version as Version;
}

export function maybeVersion(id: string): Version | null {
  return Version.load(id);
}

export function createVersion(address: Address, name: string, context: Context): Version {
  let version = new Version(address.toHex());
  context.entities.version = version;
  context.registry = context.contracts.version.registry().toHex();

  let registry = context.contracts.registry;
  let adapters = registry.getRegisteredExchangeAdapters();
  let exchanges: Address[] = [];
  for (let i: i32 = 0; i < adapters.length; i++) {
    exchanges.push(registry.exchangeForAdapter(adapters[i]));
  }

  let assets = registry.getRegisteredAssets();
  version.name = name;
  version.assets = ensureAssets(assets, context).map<string>((item) => item.id);
  version.exchanges = ensureExchanges(exchanges, context).map<string>((exchange) => exchange.id);
  version.priceSource = ensurePriceSource(context.contracts.registry.priceSource(), context).id;
  version.save();

  DataSourceTemplate.createWithContext('VersionContract', [context.version], context.context);
  DataSourceTemplate.createWithContext('RegistryContract', [context.registry], context.context);
  DataSourceTemplate.createWithContext(
    'PriceSourceContract',
    [context.contracts.registry.priceSource().toHex()],
    context.context,
  );

  return version;
}
