import { Address, DataSourceTemplate } from '@graphprotocol/graph-ts';
import { Version } from '../generated/schema';
import { Context } from '../context';
import { ensureAssets } from './Asset';
import { logCritical } from '../utils/logCritical';

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

export function createVersion(address: Address, context: Context): Version {
  let version = new Version(address.toHex());
  context.entities.version = version;
  context.registry = context.contracts.version.registry().toHex();

  let registry = context.contracts.registry;
  let adapters = registry.getRegisteredExchangeAdapters();
  let exchanges: Address[] = [];
  for (let i: i32 = 0; i < adapters.length; i++) {
    let exchange = registry.getExchangeInformation(adapters[i]).value0;
    exchanges.push(exchange);
  }

  let assets = registry.getRegisteredAssets();
  version.assets = ensureAssets(assets, context).map<string>((item) => item.id);
  version.exchanges = exchanges.map<string>((exchange) => exchange.toHex());
  version.save();

  DataSourceTemplate.createWithContext('VersionContract', [context.version], context.context);
  DataSourceTemplate.createWithContext('RegistryContract', [context.registry], context.context);

  return version;
}
