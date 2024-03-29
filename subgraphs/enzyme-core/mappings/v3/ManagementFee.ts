import { ensureManagementFee } from '../../entities/ManagementFee';
import { ActivatedForMigratedFund, FundSettingsAdded, Settled } from '../../generated/contracts/ManagementFee3Events';

// New event in v3
export function handleActivatedForMigratedFund(event: ActivatedForMigratedFund): void {
  let fee = ensureManagementFee(event.params.comptrollerProxy, event.address, event);
  fee.activatedForMigratedFundAt = event.block.timestamp.toI32();
  fee.save();
}

export function handleFundSettingsAdded(event: FundSettingsAdded): void {
  let fee = ensureManagementFee(event.params.comptrollerProxy, event.address, event);
  fee.scaledPerSecondRate = event.params.scaledPerSecondRate;
  fee.save();
}

export function handleSettled(event: Settled): void {
  let fee = ensureManagementFee(event.params.comptrollerProxy, event.address, event);
  fee.lastSettled = event.block.timestamp.toI32();
  fee.save();
}
