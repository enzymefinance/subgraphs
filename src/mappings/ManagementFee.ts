import { ensureAccount } from '../entities/Account';
import { useFee } from '../entities/Fee';
import { trackFeeState } from '../entities/FeeState';
import { useFund } from '../entities/Fund';
import { ensureManagementFeeSetting } from '../entities/ManagementFeeSetting';
import { managementFeeStateId, useManagementFeeState } from '../entities/ManagementFeeState';
import { ensureTransaction } from '../entities/Transaction';
import { ComptrollerLibContract } from '../generated/ComptrollerLibContract';
import { FundSettingsAdded, Settled } from '../generated/ManagementFeeContract';
import { ManagementFeeSettingsAddedEvent, ManagementFeeSettledEvent } from '../generated/schema';
import { arrayUnique } from '../utils/arrayUnique';
import { genericId } from '../utils/genericId';
import { toBigDecimal } from '../utils/toBigDecimal';

export function handleFundSettingsAdded(event: FundSettingsAdded): void {
  let comptroller = ComptrollerLibContract.bind(event.params.comptrollerProxy);
  let vault = comptroller.getVaultProxy();
  let fee = useFee(event.address.toHex());
  let scaledPerSecondRate = event.params.scaledPerSecondRate;

  let feeSettings = new ManagementFeeSettingsAddedEvent(genericId(event));
  feeSettings.fund = vault.toHex(); // fund does not exist yet
  feeSettings.account = ensureAccount(event.transaction.from, event).id;
  feeSettings.timestamp = event.block.timestamp;
  feeSettings.transaction = ensureTransaction(event).id;
  feeSettings.comptrollerProxy = event.params.comptrollerProxy.toHex();
  feeSettings.scaledPerSecondRate = scaledPerSecondRate;
  feeSettings.save();

  let setting = ensureManagementFeeSetting(vault.toHex(), fee);
  setting.scaledPerSecondRate = scaledPerSecondRate;
  setting.events = arrayUnique<string>(setting.events.concat([feeSettings.id]));
  setting.timestamp = event.block.timestamp;
  setting.save();
}

export function handleSettled(event: Settled): void {
  let comptroller = ComptrollerLibContract.bind(event.params.comptrollerProxy);
  let fund = useFund(comptroller.getVaultProxy().toHex());
  let fee = useFee(event.address.toHex());
  let shares = toBigDecimal(event.params.sharesQuantity);

  let settled = new ManagementFeeSettledEvent(genericId(event));
  settled.fund = fund.id;
  settled.account = ensureAccount(event.transaction.from, event).id;
  settled.timestamp = event.block.timestamp;
  settled.transaction = ensureTransaction(event).id;
  settled.comptrollerProxy = event.params.comptrollerProxy.toHex();
  settled.sharesDue = shares;
  settled.secondsSinceSettlement = event.params.secondsSinceSettlement;
  settled.save();

  trackFeeState(fund, fee, shares, event, settled);

  let managementFeeState = useManagementFeeState(managementFeeStateId(fund, event));
  managementFeeState.lastSettled = event.block.timestamp;
  managementFeeState.save();
}
