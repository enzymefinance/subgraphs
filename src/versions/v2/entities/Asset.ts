import { Address, log } from '@graphprotocol/graph-ts';
import { Asset } from '../generated/schema';
import { RegistryContract } from '../generated/v2/VersionContract/RegistryContract';
import { VersionContract } from '../generated/v2/VersionContract/VersionContract';

export function ensureAsset(assetAddress: Address, versionAddress: Address | null = null): Asset {
  let asset = Asset.load(assetAddress.toHex()) as Asset;
  if (asset) {
    return asset;
  }

  if (!versionAddress) {
    log.critical('Missing expected asset {}.', [assetAddress.toHex()]);
  }

  let versionContract = VersionContract.bind(versionAddress as Address);
  let registryContract = RegistryContract.bind(versionContract.registry());
  if (!registryContract.assetIsRegistered(assetAddress)) {
    log.critical('Tried to initialize asset {} that is not currently registered for version {}.', [
      assetAddress.toHex(),
      (versionAddress as Address).toHex(),
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
