import { arrayUnique, logCritical, toBigDecimal, uniqueEventId } from '@enzymefinance/subgraph-utils';
import { ensureComptrollerProxy } from '../entities/ComptrollerProxy';
import { ensureFee } from '../entities/Fee';
import { trackFeeState } from '../entities/FeeState';
import { ensureManagementFeeSetting } from '../entities/ManagementFeeSetting';
import { managementFeeStateId, useManagementFeeState } from '../entities/ManagementFeeState';
import { ensureTransaction } from '../entities/Transaction';
import { useVault } from '../entities/Vault';
import { FundSettingsAdded, Settled } from '../generated/ManagementFeeContract';
import { ManagementFeeSettingsAddedEvent, ManagementFeeSettledEvent } from '../generated/schema';

// TODO: handle activatedForFund

export function handleFundSettingsAdded(event: FundSettingsAdded): void {
  let fee = ensureFee(event.address);
  let scaledPerSecondRate = event.params.scaledPerSecondRate;

  let feeSettings = new ManagementFeeSettingsAddedEvent(uniqueEventId(event));
  feeSettings.timestamp = event.block.timestamp;
  feeSettings.transaction = ensureTransaction(event).id;
  feeSettings.comptroller = event.params.comptrollerProxy.toHex();
  feeSettings.scaledPerSecondRate = scaledPerSecondRate;
  feeSettings.save();

  let setting = ensureManagementFeeSetting(event.params.comptrollerProxy.toHex(), fee);
  setting.scaledPerSecondRate = scaledPerSecondRate;
  setting.events = arrayUnique<string>(setting.events.concat([feeSettings.id]));
  setting.timestamp = event.block.timestamp;
  setting.save();
}

export function handleSettled(event: Settled): void {
  let comptrollerProxy = ensureComptrollerProxy(event.params.comptrollerProxy, event);
  if (comptrollerProxy.vault == null) {
    logCritical('no vault attached to comptrollerProxy {}', [comptrollerProxy.id]);
    return;
  }

  let vault = useVault(comptrollerProxy.vault);
  let fee = ensureFee(event.address);
  let shares = toBigDecimal(event.params.sharesQuantity);

  let settled = new ManagementFeeSettledEvent(uniqueEventId(event));
  settled.vault = vault.id;
  settled.timestamp = event.block.timestamp;
  settled.transaction = ensureTransaction(event).id;
  settled.comptroller = event.params.comptrollerProxy.toHex();
  settled.sharesDue = shares;
  settled.secondsSinceSettlement = event.params.secondsSinceSettlement;
  settled.save();

  trackFeeState(vault, fee, shares, event, settled);

  let managementFeeState = useManagementFeeState(managementFeeStateId(vault, event));
  managementFeeState.lastSettled = event.block.timestamp;
  managementFeeState.save();
}
