import { uniqueEventId } from '.../../../utils/utils/id';
import { logCritical } from '.../../../utils/utils/logging';
import { BigDecimal } from '@graphprotocol/graph-ts';
import { arrayUnique } from '../../../utils/utils/array';
import { toBigDecimal } from '../../../utils/utils/math';
import { ensureComptrollerProxy } from '../entities/ComptrollerProxy';
import { ensureEntranceRateBurnFeeSetting } from '../entities/EntranceRateBurnFeeSetting';
import { entranceRateBurnFeeStateId, useEntranceRateBurnFeeState } from '../entities/EntranceRateBurnFeeState';
import { ensureFee } from '../entities/Fee';
import { trackFeeState } from '../entities/FeeState';
import { ensureTransaction } from '../entities/Transaction';
import { useVault } from '../entities/Vault';
import { FundSettingsAdded, Settled } from '../generated/EntranceRateBurnFeeContract';
import { EntranceRateBurnFeeSettingsAddedEvent, EntranceRateBurnFeeSettledEvent } from '../generated/schema';

export function handleFundSettingsAdded(event: FundSettingsAdded): void {
  let fee = ensureFee(event.address);
  let rate = toBigDecimal(event.params.rate);

  let feeSettings = new EntranceRateBurnFeeSettingsAddedEvent(uniqueEventId(event));
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
  if (comptrollerProxy.vault == null) {
    logCritical('no vault attached to comptrollerProxy {}', [comptrollerProxy.id]);
    return;
  }

  let fund = useVault(comptrollerProxy.vault);
  let fee = ensureFee(event.address);
  let shares = toBigDecimal(event.params.sharesQuantity);

  let settled = new EntranceRateBurnFeeSettledEvent(uniqueEventId(event));
  settled.vault = fund.id;
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
