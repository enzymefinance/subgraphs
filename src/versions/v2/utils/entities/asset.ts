import { Address } from '@graphprotocol/graph-ts';
import { Asset } from '../../generated/schema';
import { RegistryContract } from '../../generated/v2/VersionContract/RegistryContract';
import { VersionContract } from '../../generated/v2/VersionContract/VersionContract';

export function ensureAsset(assetAddress: Address, versionAddress: Address): Asset {
  let asset = Asset.load(assetAddress.toHex()) as Asset;
  if (asset) {
    return asset;
  }

  let versionContract = VersionContract.bind(versionAddress);
  let registryContract = RegistryContract.bind(versionContract.registry());
  if (!registryContract.assetIsRegistered(assetAddress)) {
    throw new Error('Tried to initialize an asset that is not currently registered.');
  }

  let assetInformation = registryContract.assetInformation(assetAddress);
  asset = new Asset(assetAddress.toHex());
  asset.name = assetInformation.value1;
  asset.symbol = assetInformation.value2;
  asset.decimals = assetInformation.value3.toI32();
  asset.save();

  return asset;
}
