import { BigInt } from '@graphprotocol/graph-ts';
import { GuaranteedRedemptionSetting, Policy } from '../generated/schema';
import { policySettingId } from './PolicySetting';

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
  setting.enabled = true;
  setting.save();

  return setting;
}
