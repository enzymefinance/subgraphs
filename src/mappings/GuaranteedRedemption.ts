import {
  AdapterAdded,
  AdapterRemoved,
  FundSettingsSet,
  RedemptionWindowBufferSet,
} from '../generated/GuaranteedRedemptionContract';

export function handleAdapterAdded(event: AdapterAdded): void {}
export function handleAdapterRemoved(event: AdapterRemoved): void {}
export function handleFundSettingsSet(event: FundSettingsSet): void {}
export function handleRedemptionWindowBufferSet(event: RedemptionWindowBufferSet): void {}
