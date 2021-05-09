import { ensureGuaranteedRedemption } from '../entities/GuaranteedRedemption';
import { ensureGuaranteedRedemptionSetting } from '../entities/GuaranteedRedemptionSetting';
import { ensureIntegrationAdapter } from '../entities/IntegrationAdapter';
import { ensurePolicy } from '../entities/Policy';
import { ensureTransaction } from '../entities/Transaction';
import { ComptrollerLibContract } from '../generated/ComptrollerLibContract';
import {
  AdapterAdded,
  AdapterRemoved,
  FundSettingsSet,
  RedemptionWindowBufferSet,
} from '../generated/GuaranteedRedemptionContract';
import {
  GuaranteedRedemptionAdapterAddedEvent,
  GuaranteedRedemptionFundSettingsSetEvent,
  GuaranteedRedemptionRedemptionWindowBufferSetEvent,
} from '../generated/schema';
import { arrayDiff } from '../utils/arrayDiff';
import { arrayUnique } from '../utils/arrayUnique';
import { genericId } from '../utils/genericId';

export function handleAdapterAdded(event: AdapterAdded): void {
  let adapterId = event.params.adapter.toHex(); // adapter entity may not exist

  let adapterAdded = new GuaranteedRedemptionAdapterAddedEvent(genericId(event));
  adapterAdded.timestamp = event.block.timestamp;
  adapterAdded.adapter = adapterId;
  adapterAdded.transaction = ensureTransaction(event).id;
  adapterAdded.save();

  let guaranteedRedemption = ensureGuaranteedRedemption(event.address);
  guaranteedRedemption.adapters = arrayUnique<string>(guaranteedRedemption.adapters.concat([adapterId]));
  guaranteedRedemption.save();
}
export function handleAdapterRemoved(event: AdapterRemoved): void {
  let adapter = ensureIntegrationAdapter(event.params.adapter);

  let adapterRemoved = new GuaranteedRedemptionAdapterAddedEvent(genericId(event));
  adapterRemoved.timestamp = event.block.timestamp;
  adapterRemoved.adapter = adapter.id;
  adapterRemoved.transaction = ensureTransaction(event).id;
  adapterRemoved.save();

  let guaranteedRedemption = ensureGuaranteedRedemption(event.address);
  guaranteedRedemption.adapters = arrayDiff<string>(guaranteedRedemption.adapters, [adapter.id]);
  guaranteedRedemption.save();
}
export function handleFundSettingsSet(event: FundSettingsSet): void {
  let comptroller = ComptrollerLibContract.bind(event.params.comptrollerProxy);
  let fundId = comptroller.getVaultProxy().toHex(); // fund entity may not exist yet
  let policy = ensurePolicy(event.address);

  let settingsSet = new GuaranteedRedemptionFundSettingsSetEvent(genericId(event));
  settingsSet.fund = fundId;
  settingsSet.timestamp = event.block.timestamp;
  settingsSet.transaction = ensureTransaction(event).id;
  settingsSet.comptrollerProxy = event.params.comptrollerProxy.toHex();
  settingsSet.startTimestamp = event.params.startTimestamp;
  settingsSet.duration = event.params.duration;
  settingsSet.save();

  let setting = ensureGuaranteedRedemptionSetting(event.params.comptrollerProxy.toHex(), policy);
  setting.startTimestamp = settingsSet.startTimestamp;
  setting.duration = settingsSet.duration;
  setting.events = arrayUnique<string>(setting.events.concat([settingsSet.id]));
  setting.timestamp = event.block.timestamp;
  setting.save();
}
export function handleRedemptionWindowBufferSet(event: RedemptionWindowBufferSet): void {
  let windowBufferSet = new GuaranteedRedemptionRedemptionWindowBufferSetEvent(genericId(event));
  windowBufferSet.timestamp = event.block.timestamp;
  windowBufferSet.prevBuffer = event.params.prevBuffer;
  windowBufferSet.nextBuffer = event.params.nextBuffer;
  windowBufferSet.transaction = ensureTransaction(event).id;
  windowBufferSet.save();

  let guaranteedRedemption = ensureGuaranteedRedemption(event.address);
  guaranteedRedemption.buffer = event.params.nextBuffer;
  guaranteedRedemption.save();
}
