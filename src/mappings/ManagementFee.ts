import { BigDecimal } from '@graphprotocol/graph-ts';
import { ensureComptrollerProxy } from '../entities/ComptrollerProxy';
import { ensureFee } from '../entities/Fee';
import { trackFeeState } from '../entities/FeeState';
import { useFund } from '../entities/Fund';
import { ensureManagementFeeSetting } from '../entities/ManagementFeeSetting';
import { managementFeeStateId, useManagementFeeState } from '../entities/ManagementFeeState';
import { ensureTransaction } from '../entities/Transaction';
import { ActivatedForMigratedFund, FundSettingsAdded, Settled } from '../generated/ManagementFeeContract';
import {
  ManagementFeeActivatedForMigratedFundEvent,
  ManagementFeeSettingsAddedEvent,
  ManagementFeeSettledEvent,
} from '../generated/schema';
import { arrayUnique } from '../utils/arrayUnique';
import { genericId } from '../utils/genericId';
import { logCritical } from '../utils/logCritical';
import { toBigDecimal } from '../utils/toBigDecimal';

export function handleActivatedForMigratedFund(event: ActivatedForMigratedFund): void {
  let comptrollerProxy = ensureComptrollerProxy(event.params.comptrollerProxy, event);
  if (comptrollerProxy.fund == null) {
    logCritical('no vault attached to comptrollerProxy {}', [comptrollerProxy.id]);
    return;
  }

  let fund = useFund(comptrollerProxy.fund);
  let fee = ensureFee(event.address);

  let settled = new ManagementFeeActivatedForMigratedFundEvent(genericId(event));
  settled.fund = fund.id;
  settled.timestamp = event.block.timestamp;
  settled.transaction = ensureTransaction(event).id;
  settled.comptroller = event.params.comptrollerProxy.toHex();
  settled.save();

  trackFeeState(fund, fee, BigDecimal.fromString('0'), event, settled);

  let managementFeeState = useManagementFeeState(managementFeeStateId(fund, event));
  managementFeeState.lastSettled = event.block.timestamp;
  managementFeeState.save();
}

export function handleFundSettingsAdded(event: FundSettingsAdded): void {
  let fee = ensureFee(event.address);
  let scaledPerSecondRate = event.params.scaledPerSecondRate;

  let feeSettings = new ManagementFeeSettingsAddedEvent(genericId(event));
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
  if (comptrollerProxy.fund == null) {
    logCritical('no vault attached to comptrollerProxy {}', [comptrollerProxy.id]);
    return;
  }

  let fund = useFund(comptrollerProxy.fund);
  let fee = ensureFee(event.address);
  let shares = toBigDecimal(event.params.sharesQuantity);

  let settled = new ManagementFeeSettledEvent(genericId(event));
  settled.fund = fund.id;
  settled.timestamp = event.block.timestamp;
  settled.transaction = ensureTransaction(event).id;
  settled.comptroller = event.params.comptrollerProxy.toHex();
  settled.sharesDue = shares;
  settled.secondsSinceSettlement = event.params.secondsSinceSettlement;
  settled.save();

  trackFeeState(fund, fee, shares, event, settled);

  let managementFeeState = useManagementFeeState(managementFeeStateId(fund, event));
  managementFeeState.lastSettled = event.block.timestamp;
  managementFeeState.save();
}
