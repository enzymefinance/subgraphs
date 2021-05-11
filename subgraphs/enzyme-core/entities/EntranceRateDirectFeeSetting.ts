import { BigDecimal, BigInt } from '@graphprotocol/graph-ts';
import { EntranceRateDirectFeeSetting, Fee } from '../generated/schema';
import { feeSettingId } from '../utils/feeSettingId';

export function ensureEntranceRateDirectFeeSetting(comptrollerId: string, fee: Fee): EntranceRateDirectFeeSetting {
  let id = feeSettingId(comptrollerId, fee);
  let setting = EntranceRateDirectFeeSetting.load(id) as EntranceRateDirectFeeSetting;

  if (setting) {
    return setting;
  }

  setting = new EntranceRateDirectFeeSetting(id);
  setting.fee = fee.id;
  setting.comptroller = comptrollerId;
  setting.rate = BigDecimal.fromString('0');
  setting.events = new Array<string>();
  setting.timestamp = BigInt.fromI32(0);
  setting.save();

  return setting;
}
