import { Fee } from '../generated/schema';

export function feeSettingId(fundId: string, fee: Fee): string {
  return fundId + '/' + fee.id;
}
