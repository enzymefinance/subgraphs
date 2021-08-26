import { toBigDecimal } from '@enzymefinance/subgraph-utils';
import { ensureExitRateBurnFee } from '../../entities/ExitRateBurnFee';
import { FundSettingsAdded, Settled } from '../../generated/ExitRateBurnFee4Contract';

export function handleFundSettingsAdded(event: FundSettingsAdded): void {
  let fee = ensureExitRateBurnFee(event.params.comptrollerProxy, event.address, event);
  fee.inKindRate = toBigDecimal(event.params.inKindRate, 4);
  fee.specificAssetsRate = toBigDecimal(event.params.specificAssetsRate, 4);
  fee.save();
}

export function handleSettled(event: Settled): void {
  let fee = ensureExitRateBurnFee(event.params.comptrollerProxy, event.address, event);
  fee.lastSettled = event.block.timestamp.toI32();
  fee.save();
}
