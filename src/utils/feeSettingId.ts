import { Fee } from '../generated/schema';

export function feeSettingId(comptrollerProxyId: string, fee: Fee): string {
  return comptrollerProxyId + '/' + fee.id;
}
