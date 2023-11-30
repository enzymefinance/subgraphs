import { ensureNoDepegOnRedeemSharesForSpecificAssetsPolicy } from '../../entities/NoDepegOnRedeemSharesForSpecificAssetsPolicy';
import { FundSettingsUpdated } from '../../generated/contracts/NoDepegOnRedeemSharesForSpecificAssetsPolicy4Events';
import { Bytes } from '@graphprotocol/graph-ts';

export function handleFundSettingsUpdated(event: FundSettingsUpdated): void {
  let policy = ensureNoDepegOnRedeemSharesForSpecificAssetsPolicy(event.params.comptrollerProxy, event.address, event);
  let assets: Bytes[] = [];
  let referenceAssets: Bytes[] = [];
  let deviationTolerancesInBps: i32[] = [];
  for (let i = 0; i < event.params.assetConfigs.length; i++) {
    assets = assets.concat([event.params.assetConfigs[i].asset]);
    referenceAssets = referenceAssets.concat([event.params.assetConfigs[i].referenceAsset]);
    deviationTolerancesInBps = deviationTolerancesInBps.concat([event.params.assetConfigs[i].deviationToleranceInBps]);
  }
  policy.assets = assets;
  policy.referenceAssets = referenceAssets;
  policy.deviationTolerancesInBps = deviationTolerancesInBps;
  policy.updatedAt = event.block.timestamp.toI32();
  policy.save();
}
