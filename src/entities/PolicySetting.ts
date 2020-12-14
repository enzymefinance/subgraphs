import { Policy } from '../generated/schema';
import { PolicySetting } from './PolicySettingEntity';

export function policySettingId(fundId: string, policy: Policy): string {
  return fundId + '/' + policy.id;
}

export function trackPolicySettingEnabled(fundId: string, policy: Policy): void {
  let policyId = policySettingId(fundId, policy);
  let policySetting = PolicySetting.load(policy.identifier, policyId) as PolicySetting;

  if (policySetting == null) {
    return;
  }

  policySetting.enabled = true;
  policySetting.save(policy.identifier);
}

export function trackPolicySettingDisabled(fundId: string, policy: Policy): void {
  let policyId = policySettingId(fundId, policy);
  let policySetting = PolicySetting.load(policy.identifier, policyId) as PolicySetting;

  if (policySetting == null) {
    return;
  }

  policySetting.enabled = false;
  policySetting.save(policy.identifier);
}
