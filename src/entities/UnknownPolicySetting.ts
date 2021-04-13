import { BigInt } from '@graphprotocol/graph-ts';
import { Policy, UnknownPolicySetting } from '../generated/schema';
import { policySettingId } from './PolicySetting';

export function ensureUnknownPolicySetting(fundId: string, policy: Policy): UnknownPolicySetting {
  let id = policySettingId(fundId, policy);
  let setting = UnknownPolicySetting.load(id) as UnknownPolicySetting;

  if (setting) {
    return setting;
  }

  setting = new UnknownPolicySetting(id);
  setting.policy = policy.id;
  setting.fund = fundId;
  setting.events = new Array<string>();
  setting.timestamp = BigInt.fromI32(0);
  setting.enabled = true;
  setting.save();

  return setting;
}
