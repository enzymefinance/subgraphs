import { toBigDecimal } from '@enzymefinance/subgraph-utils';
import { ensureEntranceRateDirectFee } from '../../entities/EntranceRateDirectFee';
import { FundSettingsAdded, Settled } from '../../generated/EntranceRateDirectFee3Contract';

export function handleFundSettingsAdded(event: FundSettingsAdded): void {
  let fee = ensureEntranceRateDirectFee(event.params.comptrollerProxy, event.address, event);
  fee.rate = toBigDecimal(event.params.rate);
  fee.save();
}

export function handleSettled(event: Settled): void {
  let fee = ensureEntranceRateDirectFee(event.params.comptrollerProxy, event.address, event);
  fee.lastSettled = event.block.timestamp.toI32();
  fee.save();
}
