import { Policy } from '../generated/schema';

export function policySettingId(fundId: string, policy: Policy): string {
  return fundId + '/' + policy.id;
}
