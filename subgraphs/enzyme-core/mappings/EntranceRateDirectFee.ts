import { BigDecimal } from '@graphprotocol/graph-ts';
import { arrayUnique } from '../../../utils/utils/array';
import { uniqueEventId } from '../../../utils/utils/id';
import { toBigDecimal } from '../../../utils/utils/math';
import { ensureEntranceRateDirectFeeSetting } from '../entities/EntranceRateDirectFeeSetting';
import { entranceRateDirectFeeStateId, useEntranceRateDirectFeeState } from '../entities/EntranceRateDirectFeeState';
import { ensureFee } from '../entities/Fee';
import { trackFeeState } from '../entities/FeeState';
import { ensureTransaction } from '../entities/Transaction';
import { useVault } from '../entities/Vault';
import { ComptrollerLibContract } from '../generated/ComptrollerLibContract';
import { FundSettingsAdded, Settled } from '../generated/EntranceRateDirectFeeContract';
import { EntranceRateDirectFeeSettingsAddedEvent, EntranceRateDirectFeeSettledEvent } from '../generated/schema';

export function handleFundSettingsAdded(event: FundSettingsAdded): void {
  let comptroller = ComptrollerLibContract.bind(event.params.comptrollerProxy);
  let vault = comptroller.getVaultProxy();
  let fee = ensureFee(event.address);
  let rate = toBigDecimal(event.params.rate);

  let feeSettings = new EntranceRateDirectFeeSettingsAddedEvent(uniqueEventId(event));
  feeSettings.timestamp = event.block.timestamp;
  feeSettings.transaction = ensureTransaction(event).id;
  feeSettings.comptroller = event.params.comptrollerProxy.toHex();
  feeSettings.rate = rate;
  feeSettings.save();

  let setting = ensureEntranceRateDirectFeeSetting(vault.toHex(), fee);
  setting.rate = rate;
  setting.events = arrayUnique<string>(setting.events.concat([feeSettings.id]));
  setting.timestamp = event.block.timestamp;
  setting.save();
}

export function handleSettled(event: Settled): void {
  let comptroller = ComptrollerLibContract.bind(event.params.comptrollerProxy);
  let fund = useVault(comptroller.getVaultProxy().toHex());
  let fee = ensureFee(event.address);
  let shares = toBigDecimal(event.params.sharesQuantity);

  let settled = new EntranceRateDirectFeeSettledEvent(uniqueEventId(event));
  settled.vault = fund.id;
  settled.timestamp = event.block.timestamp;
  settled.transaction = ensureTransaction(event).id;
  settled.comptrollerProxy = event.params.comptrollerProxy.toHex();
  settled.sharesQuantity = shares;
  settled.payer = event.params.payer.toHex();
  settled.save();

  trackFeeState(fund, fee, BigDecimal.fromString('0'), event, settled);

  let entranceRateDirectFeeState = useEntranceRateDirectFeeState(entranceRateDirectFeeStateId(fund, event));
  entranceRateDirectFeeState.lastSettled = event.block.timestamp;
  entranceRateDirectFeeState.save();
}
