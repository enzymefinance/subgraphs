import { BigDecimal, BigInt } from '@graphprotocol/graph-ts';
import { Fee, PerformanceFeeSetting } from '../generated/schema';
import { feeSettingId } from '../utils/feeSettingId';

export function ensurePerformanceFeeSetting(comptrollerProxyId: string, fee: Fee): PerformanceFeeSetting {
  let id = feeSettingId(comptrollerProxyId, fee);
  let setting = PerformanceFeeSetting.load(id) as PerformanceFeeSetting;

  if (setting) {
    return setting;
  }

  setting = new PerformanceFeeSetting(id);
  setting.fee = fee.id;
  setting.comptroller = comptrollerProxyId;
  setting.rate = BigDecimal.fromString('0');
  setting.period = BigInt.fromI32(0);
  setting.activated = BigInt.fromI32(0);
  setting.events = new Array<string>();
  setting.timestamp = BigInt.fromI32(0);
  setting.save();

  return setting;
}
