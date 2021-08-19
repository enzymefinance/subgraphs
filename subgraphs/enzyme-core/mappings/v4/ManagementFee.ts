import { ensureAccount } from '../../entities/Account';
import { ensureManagementFee } from '../../entities/ManagementFee';
import {
  ActivatedForMigratedFund,
  FundSettingsAdded,
  RecipientSetForFund,
  Settled,
} from '../../generated/ManagementFee4Contract';

export function handleActivatedForMigratedFund(event: ActivatedForMigratedFund): void {
  let fee = ensureManagementFee(event.params.comptrollerProxy, event.address, event);
  fee.scaledPerSecondRate = event.block.timestamp;
  fee.save();
}

export function handleFundSettingsAdded(event: FundSettingsAdded): void {
  let fee = ensureManagementFee(event.params.comptrollerProxy, event.address, event);
  fee.scaledPerSecondRate = event.params.scaledPerSecondRate;
  fee.save();
}

export function handleRecipientSetForFund(event: RecipientSetForFund): void {
  let recipient = ensureAccount(event.params.recipient, event);

  let fee = ensureManagementFee(event.params.comptrollerProxy, event.address, event);
  fee.recipient = recipient.id;
  fee.save();
}

export function handleSettled(event: Settled): void {
  let fee = ensureManagementFee(event.params.comptrollerProxy, event.address, event);
  fee.lastSettled = event.block.timestamp;
  fee.save();
}
