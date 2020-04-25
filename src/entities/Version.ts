import { Address, DataSourceTemplate, log } from '@graphprotocol/graph-ts';
import { Version } from '../generated/schema';
import { Context } from '../context';
import { ensureAssets } from './Asset';

export function useVersion(id: string): Version {
  let version = Version.load(id);
  if (version == null) {
    log.critical('Failed to load version {}.', [id]);
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

  let assets = context.contracts.registry.getRegisteredAssets();
  version.assets = ensureAssets(assets, context).map<string>((item) => item.id);
  version.save();

  DataSourceTemplate.createWithContext('VersionContract', [context.version], context.context);
  DataSourceTemplate.createWithContext('RegistryContract', [context.registry], context.context);

  return version;
}
