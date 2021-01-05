import { BigInt } from '@graphprotocol/graph-ts';
import { Fund, Policy, UnknownPolicySetting } from '../generated/schema';
import { logCritical } from '../utils/logCritical';
import { policySettingId } from './PolicySetting';

export function useUnknownPolicySetting(fund: Fund, policy: Policy): UnknownPolicySetting {
  let id = policySettingId(fund.id, policy);
  let setting = UnknownPolicySetting.load(id) as UnknownPolicySetting;

  if (setting == null) {
    logCritical('Failed to load UnknownPolicySetting {}.', [id]);
  }

  return setting;
}

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
