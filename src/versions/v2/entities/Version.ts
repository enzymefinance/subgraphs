import { Address, DataSourceContext, DataSourceTemplate } from '@graphprotocol/graph-ts';
import { RegistryContract } from '../generated/v2/VersionContract/RegistryContract';
import { VersionContract } from '../generated/v2/VersionContract/VersionContract';
import { Version, Asset } from '../generated/schema';
import { ensureAsset } from './Asset';

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

  let assets: Asset[] = [];
  for (let i: i32 = 0; i < registeredAssets.length; i++) {
    assets.push(ensureAsset(registeredAssets[i], version));
  }

  return assets;
}

function createRegistryDataSource(version: Version): void {
  let versionContract = VersionContract.bind(Address.fromString(version.id));
  let registryAddress = versionContract.registry();

  let registryContext = new DataSourceContext();
  registryContext.setString('version', version.id);

  DataSourceTemplate.createWithContext('v2/RegistryContract', [registryAddress.toHex()], registryContext);
}
