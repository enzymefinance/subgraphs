import { Address, DataSourceContext, DataSourceTemplate } from '@graphprotocol/graph-ts';
import { RegistryContract } from '../generated/v2/VersionContract/RegistryContract';
import { VersionContract } from '../generated/v2/VersionContract/VersionContract';
import { Version, Asset } from '../generated/schema';
import { ensureAsset } from './asset';

export function ensureVersion(versionAddress: Address): Version {
  let version = Version.load(versionAddress.toHex()) as Version;
  if (version) {
    return version;
  }

  let versionContract = VersionContract.bind(versionAddress);
  let registryAddress = versionContract.registry();

  // Start observing the registry on behalf of this version.
  createRegistryDataSource(versionAddress, registryAddress);

  version = new Version(versionAddress.toHex());
  version.assets = versionAssets(versionAddress, registryAddress).map<string>((item) => item.id);
  version.save();

  return version;
}

export function versionAssets(versionAddress: Address, registryAddress: Address): Asset[] {
  let assets: Asset[] = [];
  let registryContract = RegistryContract.bind(registryAddress);
  let registeredAssets = registryContract.getRegisteredAssets();

  for (let i: i32 = 0; i < registeredAssets.length; i++) {
    assets.push(ensureAsset(registeredAssets[i], versionAddress));
  }

  return assets;
}

function createRegistryDataSource(versionAddress: Address, registryAddress: Address): void {
  let registryContext = new DataSourceContext();
  registryContext.setString('version', versionAddress.toHex());

  DataSourceTemplate.createWithContext('v2/RegistryContract', [registryAddress.toHex()], registryContext);
}
