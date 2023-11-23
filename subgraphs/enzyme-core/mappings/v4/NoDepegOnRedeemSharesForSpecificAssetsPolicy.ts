import { ensureNoDepegOnRedeemSharesForSpecificAssetsPolicy } from '../../entities/NoDepegOnRedeemSharesForSpecificAssetsPolicy';
import { FundSettingsUpdated } from '../../generated/contracts/NoDepegOnRedeemSharesForSpecificAssetsPolicy4Events';

export function handleFundSettingsSet(event: FundSettingsUpdated): void {
  let policy = ensureNoDepegOnRedeemSharesForSpecificAssetsPolicy(event.params.comptrollerProxy, event.address, event);
  policy.assetConfigs = event.params.assetConfigs;
  policy.updatedAt = event.block.timestamp.toI32();
  policy.save();
}
