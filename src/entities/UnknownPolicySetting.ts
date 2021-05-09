import { BigInt } from '@graphprotocol/graph-ts';
import { Policy, UnknownPolicySetting } from '../generated/schema';
import { policySettingId } from './PolicySetting';

export function ensureUnknownPolicySetting(comptrollerProxyId: string, policy: Policy): UnknownPolicySetting {
  let id = policySettingId(comptrollerProxyId, policy);
  let setting = UnknownPolicySetting.load(id) as UnknownPolicySetting;

  if (setting) {
    return setting;
  }

  setting = new UnknownPolicySetting(id);
  setting.policy = policy.id;
  setting.comptroller = comptrollerProxyId;
  setting.events = new Array<string>();
  setting.timestamp = BigInt.fromI32(0);
  setting.enabled = true;
  setting.save();

  return setting;
}
