import { logCritical } from './logCritical';

export let addTrackedAssetsSelector = '0x848f3a59';
export let addTrackedAssetsMethod = 'addTrackedAssets(address,bytes,bytes)';
export let addTrackedAssetsType = 'ADD_TRACKED_ASSETS';

export let takeOrderSelector = '0x03e38a2b';
export let takeOrderMethod = 'takeOrder(address,bytes,bytes)';
export let takeOrderType = 'TAKE_ORDER';

export let lendSelector = '0x099f7515';
export let lendMethod = 'lend(address,bytes,bytes)';
export let lendType = 'LEND';

export let redeemSelector = '0xc29fa9dd';
export let redeemMethod = 'redeem(address,bytes,bytes)';
export let redeemType = 'REDEEM';

export function convertSelectorToMethod(selector: string): string {
  if (selector == addTrackedAssetsSelector) {
    return addTrackedAssetsMethod;
  }

  if (selector == takeOrderSelector) {
    return takeOrderMethod;
  }

  if (selector == lendSelector) {
    return lendMethod;
  }

  if (selector == redeemSelector) {
    return redeemMethod;
  }

  logCritical('Invalid integration selector');

  return '';
}

export function convertSelectorToType(selector: string): string {
  if (selector == addTrackedAssetsSelector) {
    return addTrackedAssetsType;
  }

  if (selector == takeOrderSelector) {
    return takeOrderType;
  }

  if (selector == lendSelector) {
    return lendType;
  }

  if (selector == redeemSelector) {
    return redeemType;
  }

  logCritical('Invalid integration selector');

  return '';
}
