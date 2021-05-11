import { BigInt } from '@graphprotocol/graph-ts';
import { Fee, ManagementFeeSetting } from '../generated/schema';
import { feeSettingId } from '../utils/feeSettingId';

export function ensureManagementFeeSetting(comptrollerProxy: string, fee: Fee): ManagementFeeSetting {
  let id = feeSettingId(comptrollerProxy, fee);
  let setting = ManagementFeeSetting.load(id) as ManagementFeeSetting;

  if (setting) {
    return setting;
  }

  setting = new ManagementFeeSetting(id);
  setting.fee = fee.id;
  setting.comptroller = comptrollerProxy;
  setting.scaledPerSecondRate = BigInt.fromI32(0);
  setting.events = new Array<string>();
  setting.timestamp = BigInt.fromI32(0);
  setting.save();

  return setting;
}
