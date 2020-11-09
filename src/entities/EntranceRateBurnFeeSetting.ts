import { BigDecimal, BigInt } from '@graphprotocol/graph-ts';
import { EntranceRateBurnFeeSetting, Fee, Fund, Policy } from '../generated/schema';
import { feeSettingId } from '../utils/feeSettingId';
import { logCritical } from '../utils/logCritical';

export function useEntranceRateBurnFeeSetting(fund: Fund, policy: Policy): EntranceRateBurnFeeSetting {
  let id = feeSettingId(fund.id, policy);
  let setting = EntranceRateBurnFeeSetting.load(id) as EntranceRateBurnFeeSetting;

  if (setting == null) {
    logCritical('Failed to load EntranceRateBurnFeeSetting {}.', [id]);
  }

  return setting;
}

export function ensureEntranceRateBurnFeeSetting(fundId: string, fee: Fee): EntranceRateBurnFeeSetting {
  let id = feeSettingId(fundId, fee);
  let setting = EntranceRateBurnFeeSetting.load(id) as EntranceRateBurnFeeSetting;

  if (setting) {
    return setting;
  }

  setting = new EntranceRateBurnFeeSetting(id);
  setting.fee = fee.id;
  setting.fund = fundId;
  setting.rate = BigDecimal.fromString('0');
  setting.events = new Array<string>();
  setting.timestamp = BigInt.fromI32(0);
  setting.save();

  return setting;
}
