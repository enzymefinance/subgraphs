import { BigInt } from '@graphprotocol/graph-ts';
import { Fee, ManagementFeeSetting } from '../generated/schema';
import { feeSettingId } from '../utils/feeSettingId';

export function ensureManagementFeeSetting(fundId: string, fee: Fee): ManagementFeeSetting {
  let id = feeSettingId(fundId, fee);
  let setting = ManagementFeeSetting.load(id) as ManagementFeeSetting;

  if (setting) {
    return setting;
  }

  setting = new ManagementFeeSetting(id);
  setting.fee = fee.id;
  setting.fund = fundId;
  setting.scaledPerSecondRate = BigInt.fromI32(0);
  setting.events = new Array<string>();
  setting.timestamp = BigInt.fromI32(0);
  setting.save();

  return setting;
}
