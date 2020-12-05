import { BigInt } from '@graphprotocol/graph-ts';
import { Fund, GuaranteedRedemptionSetting, Policy } from '../generated/schema';
import { logCritical } from '../utils/logCritical';
import { policySettingId } from '../utils/policySettingId';

export function useGuaranteedRedemptionSetting(fund: Fund, policy: Policy): GuaranteedRedemptionSetting {
  let id = policySettingId(fund.id, policy);
  let setting = GuaranteedRedemptionSetting.load(id) as GuaranteedRedemptionSetting;

  if (setting == null) {
    logCritical('Failed to load GuaranteedRedemptionSetting {}.', [id]);
  }

  return setting;
}

export function ensureGuaranteedRedemptionSetting(fundId: string, policy: Policy): GuaranteedRedemptionSetting {
  let id = policySettingId(fundId, policy);
  let setting = GuaranteedRedemptionSetting.load(id) as GuaranteedRedemptionSetting;

  if (setting) {
    return setting;
  }

  setting = new GuaranteedRedemptionSetting(id);
  setting.policy = policy.id;
  setting.fund = fundId;
  setting.startTimestamp = BigInt.fromI32(0);
  setting.duration = BigInt.fromI32(0);
  setting.events = new Array<string>();
  setting.timestamp = BigInt.fromI32(0);
  setting.save();

  return setting;
}
