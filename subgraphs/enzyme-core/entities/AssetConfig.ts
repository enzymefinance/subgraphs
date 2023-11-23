import { Address } from '@enzymefinance/environment';
import { ethereum } from '@graphprotocol/graph-ts';
import { AssetConfig } from '../generated/schema';

export function ensureAssetConfig(
  asset: Address,
  referenceAsset: Address,
  deviationToleranceInBps: number,
  event: ethereum.Event,
): AssetConfig {
  let id = asset + '-' + referenceAsset + '-' + event.address;
  let assetConfig = AssetConfig.load(id);

  if (assetConfig) {
    assetConfig.updatedAt = event.block.timestamp.toI32();
    return assetConfig;
  }

  assetConfig = new AssetConfig(id);
  assetConfig.asset = asset;
  assetConfig.referenceAsset = referenceAsset;
  assetConfig.deviationToleranceInBps = deviationToleranceInBps;
  assetConfig.createdAt = event.block.timestamp.toI32();
  assetConfig.updatedAt = event.block.timestamp.toI32();
  assetConfig.save();

  return assetConfig;
}