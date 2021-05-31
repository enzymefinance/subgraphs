import { BigDecimal, BigInt } from '@graphprotocol/graph-ts';
import { EntranceRateBurnFeeSetting, Fee } from '../generated/schema';
import { feeSettingId } from '../utils/feeSettingId';

export function ensureEntranceRateBurnFeeSetting(comptrollerId: string, fee: Fee): EntranceRateBurnFeeSetting {
  let id = feeSettingId(comptrollerId, fee);
  let setting = EntranceRateBurnFeeSetting.load(id) as EntranceRateBurnFeeSetting;

  if (setting) {
    return setting;
  }

  setting = new EntranceRateBurnFeeSetting(id);
  setting.fee = fee.id;
  setting.comptroller = comptrollerId;
  setting.rate = BigDecimal.fromString('0');
  setting.events = new Array<string>();
  setting.timestamp = BigInt.fromI32(0);
  setting.save();

  return setting;
}
