import { Address, log } from '@graphprotocol/graph-ts';
import { Asset, Version } from '../generated/schema';
import { VersionContract } from '../generated/v2/VersionContract/VersionContract';
import { RegistryContract } from '../generated/templates/v2/RegistryContract/RegistryContract';

export function ensureAssets(assetAddresses: Address[], version: Version): Asset[] {
  let assets: Asset[] = [];
  for (let i: i32 = 0; i < assetAddresses.length; i++) {
    assets.push(ensureAsset(assetAddresses[i], version));
  }

  return assets;
}

export function ensureAsset(assetAddress: Address, version: Version): Asset {
  let asset = Asset.load(assetAddress.toHex()) as Asset;
  if (asset) {
    return asset;
  }

  let versionAddress = Address.fromString((version as Version).id);
  let versionContract = VersionContract.bind(versionAddress);
  let registryContract = RegistryContract.bind(versionContract.registry());

  if (!registryContract.assetIsRegistered(assetAddress)) {
    log.critical('Tried to initialize asset {} that is not currently registered for version {}.', [
      assetAddress.toHex(),
      versionAddress.toHex(),
    ]);
  }

  let assetInformation = registryContract.assetInformation(assetAddress);
  asset = new Asset(assetAddress.toHex());
  asset.name = assetInformation.value1;
  asset.symbol = assetInformation.value2;
  asset.decimals = assetInformation.value3.toI32();
  asset.save();

  return asset;
}
