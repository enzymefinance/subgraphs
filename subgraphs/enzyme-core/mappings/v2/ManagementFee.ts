import { ensureManagementFee } from '../../entities/ManagementFee';
import { FundSettingsAdded, Settled } from '../../generated/contracts/ManagementFee2Events';

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
