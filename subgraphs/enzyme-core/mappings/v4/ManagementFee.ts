import { ZERO_ADDRESS } from '@enzymefinance/subgraph-utils';
import { ensureAccount } from '../../entities/Account';
import { ensureManagementFee } from '../../entities/ManagementFee';
import { linkSharesSplitterToVault } from '../../entities/SharesSplitter';
import {
  ActivatedForMigratedFund,
  FundSettingsAdded,
  RecipientSetForFund,
  Settled,
} from '../../generated/contracts/ManagementFee4Events';

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

export function handleRecipientSetForFund(event: RecipientSetForFund): void {
  let fee = ensureManagementFee(event.params.comptrollerProxy, event.address, event);
  if (event.params.recipient.equals(ZERO_ADDRESS)) {
    fee.recipient = null;
  } else {
    let recipient = ensureAccount(event.params.recipient, event);
    fee.recipient = recipient.id;
    linkSharesSplitterToVault(recipient, event.params.comptrollerProxy);
  }
  fee.save();
}

export function handleSettled(event: Settled): void {
  let fee = ensureManagementFee(event.params.comptrollerProxy, event.address, event);
  fee.lastSettled = event.block.timestamp.toI32();
  fee.save();
}
