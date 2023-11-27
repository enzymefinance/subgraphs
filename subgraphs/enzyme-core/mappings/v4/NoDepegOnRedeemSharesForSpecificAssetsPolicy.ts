import { AssetConfig } from '../../generated/schema';
import { ensureNoDepegOnRedeemSharesForSpecificAssetsPolicy } from '../../entities/NoDepegOnRedeemSharesForSpecificAssetsPolicy';
import { FundSettingsUpdated } from '../../generated/contracts/NoDepegOnRedeemSharesForSpecificAssetsPolicy4Events';
import { ensureAssetConfig } from '../../entities/AssetConfig';

export function handleFundSettingsUpdated(event: FundSettingsUpdated): void {
  let policy = ensureNoDepegOnRedeemSharesForSpecificAssetsPolicy(event.params.comptrollerProxy, event.address, event);
  policy.assetConfigs = event.params.assetConfigs.map<AssetConfig>((assetConfig) => ensureAssetConfig(assetConfig.asset, assetConfig.referenceAsset, assetConfig.deviationToleranceInBps, event));
  policy.updatedAt = event.block.timestamp.toI32();
  policy.save();
}
