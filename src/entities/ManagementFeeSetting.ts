import { BigDecimal, BigInt } from '@graphprotocol/graph-ts';
import { ManagementFeeSetting, Fund, Policy, Fee } from '../generated/schema';
import { feeSettingId } from '../utils/feeSettingId';
import { logCritical } from '../utils/logCritical';

export function useManagementFeeSetting(fund: Fund, policy: Policy): ManagementFeeSetting {
  let id = feeSettingId(fund.id, policy);
  let setting = ManagementFeeSetting.load(id) as ManagementFeeSetting;

  if (setting == null) {
    logCritical('Failed to load ManagementFeeSetting {}.', [id]);
  }

  return setting;
}

export function ensureManagementFeeSetting(fundId: string, fee: Fee): ManagementFeeSetting {
  let id = feeSettingId(fundId, fee);
  let setting = ManagementFeeSetting.load(id) as ManagementFeeSetting;

  if (setting) {
    return setting;
  }

  setting = new ManagementFeeSetting(id);
  setting.fee = fee.id;
  setting.fund = fundId;
  setting.rate = BigDecimal.fromString('0');
  setting.events = new Array<string>();
  setting.timestamp = BigInt.fromI32(0);
  setting.save();

  return setting;
}
