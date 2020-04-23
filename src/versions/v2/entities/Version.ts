import { Address, DataSourceContext, DataSourceTemplate } from '@graphprotocol/graph-ts';
import { VersionContract } from '../generated/v2/VersionContract/VersionContract';
import { RegistryContract } from '../generated/templates/v2/RegistryContract/RegistryContract';
import { Version, Asset } from '../generated/schema';
import { ensureAssets } from './Asset';

export function ensureVersion(versionAddress: Address): Version {
  let version = Version.load(versionAddress.toHex()) as Version;
  if (version) {
    return version;
  }

  version = new Version(versionAddress.toHex());
  version.assets = versionAssets(version).map<string>((item) => item.id);
  version.save();

  // Start observing the registry on behalf of this version.
  createRegistryDataSource(version);

  return version;
}

export function versionAssets(version: Version): Asset[] {
  let versionContract = VersionContract.bind(Address.fromString(version.id));
  let registryAddress = versionContract.registry();
  let registryContract = RegistryContract.bind(registryAddress);
  let registeredAssets = registryContract.getRegisteredAssets();

  return ensureAssets(registeredAssets, version);
}

function createRegistryDataSource(version: Version): void {
  let versionContract = VersionContract.bind(Address.fromString(version.id));
  let registryAddress = versionContract.registry();

  let registryContext = new DataSourceContext();
  registryContext.setString('version', version.id);

  DataSourceTemplate.createWithContext('v2/RegistryContract', [registryAddress.toHex()], registryContext);
}
