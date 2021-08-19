import { ensureGuaranteedRedemptionPolicy } from '../../entities/GuaranteedRedemptionPolicy';
import {
  AdapterAdded,
  AdapterRemoved,
  FundSettingsSet,
  RedemptionWindowBufferSet,
} from '../../generated/GuaranteedRedemption4Contract';

export function handleFundSettingsSet(event: FundSettingsSet): void {
  let policy = ensureGuaranteedRedemptionPolicy(event.params.comptrollerProxy, event.address, event);
  policy.startTimestamp = event.params.startTimestamp;
  policy.duration = event.params.duration;
  policy.save();
}

export function handleAdapterAdded(event: AdapterAdded): void {}
export function handleAdapterRemoved(event: AdapterRemoved): void {}
export function handleRedemptionWindowBufferSet(event: RedemptionWindowBufferSet): void {}
