import { BigDecimal } from '@graphprotocol/graph-ts';
import { ensureComptrollerProxy } from '../entities/ComptrollerProxy';
import { ensureEntranceRateBurnFeeSetting } from '../entities/EntranceRateBurnFeeSetting';
import { entranceRateBurnFeeStateId, useEntranceRateBurnFeeState } from '../entities/EntranceRateBurnFeeState';
import { ensureFee } from '../entities/Fee';
import { trackFeeState } from '../entities/FeeState';
import { useFund } from '../entities/Fund';
import { ensureTransaction } from '../entities/Transaction';
import { FundSettingsAdded, Settled } from '../generated/EntranceRateBurnFeeContract';
import { EntranceRateBurnFeeSettingsAddedEvent, EntranceRateBurnFeeSettledEvent } from '../generated/schema';
import { arrayUnique } from '../utils/arrayUnique';
import { genericId } from '../utils/genericId';
import { logCritical } from '../utils/logCritical';
import { toBigDecimal } from '../utils/toBigDecimal';

export function handleFundSettingsAdded(event: FundSettingsAdded): void {
  let fee = ensureFee(event.address);
  let rate = toBigDecimal(event.params.rate);

  let feeSettings = new EntranceRateBurnFeeSettingsAddedEvent(genericId(event));
  feeSettings.timestamp = event.block.timestamp;
  feeSettings.transaction = ensureTransaction(event).id;
  feeSettings.comptroller = event.params.comptrollerProxy.toHex();
  feeSettings.rate = rate;
  feeSettings.save();

  let setting = ensureEntranceRateBurnFeeSetting(event.params.comptrollerProxy.toHex(), fee);
  setting.rate = rate;
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

  let settled = new EntranceRateBurnFeeSettledEvent(genericId(event));
  settled.fund = fund.id;
  settled.timestamp = event.block.timestamp;
  settled.transaction = ensureTransaction(event).id;
  settled.comptrollerProxy = event.params.comptrollerProxy.toHex();
  settled.sharesQuantity = shares;
  settled.payer = event.params.payer.toHex();
  settled.save();

  trackFeeState(fund, fee, BigDecimal.fromString('0'), event, settled);

  let entranceRateBurnFeeState = useEntranceRateBurnFeeState(entranceRateBurnFeeStateId(fund, event));
  entranceRateBurnFeeState.lastSettled = event.block.timestamp;
  entranceRateBurnFeeState.save();
}
