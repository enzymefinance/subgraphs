import { toBigDecimal } from '@enzymefinance/subgraph-utils';
import { ensureNoDepegOnRedeemSharesForSpecificAssetsPolicy } from '../../entities/NoDepegOnRedeemSharesForSpecificAssetsPolicy';
import { FundSettingsUpdated } from '../../generated/contracts/NoDepegOnRedeemSharesForSpecificAssetsPolicy4Events';
import { BigDecimal, BigInt, Bytes } from '@graphprotocol/graph-ts';

export function handleFundSettingsUpdated(event: FundSettingsUpdated): void {
  let policy = ensureNoDepegOnRedeemSharesForSpecificAssetsPolicy(event.params.comptrollerProxy, event.address, event);
  let assets: Bytes[] = [];
  let referenceAssets: Bytes[] = [];
  let deviationTolerances: BigDecimal[] = [];
  for (let i = 0; i < event.params.assetConfigs.length; i++) {
    assets = assets.concat([event.params.assetConfigs[i].asset]);
    referenceAssets = referenceAssets.concat([event.params.assetConfigs[i].referenceAsset]);
    deviationTolerances = deviationTolerances.concat([
      toBigDecimal(BigInt.fromI32(event.params.assetConfigs[i].deviationToleranceInBps), 4),
    ]);
  }
  policy.assets = assets;
  policy.referenceAssets = referenceAssets;
  policy.deviationTolerances = deviationTolerances;
  policy.updatedAt = event.block.timestamp.toI32();
  policy.save();
}
