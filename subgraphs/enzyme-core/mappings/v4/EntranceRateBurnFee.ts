import { toBigDecimal } from '@enzymefinance/subgraph-utils';
import { ensureEntranceRateBurnFee } from '../../entities/EntranceRateBurnFee';
import { FundSettingsAdded, Settled } from '../../generated/contracts/EntranceRateBurnFee4Events';

export function handleFundSettingsAdded(event: FundSettingsAdded): void {
  let fee = ensureEntranceRateBurnFee(event.params.comptrollerProxy, event.address, event);
  fee.rate = toBigDecimal(event.params.rate, 4);
  fee.save();
}

export function handleSettled(event: Settled): void {
  let fee = ensureEntranceRateBurnFee(event.params.comptrollerProxy, event.address, event);
  fee.lastSettled = event.block.timestamp.toI32();
  fee.save();
}
