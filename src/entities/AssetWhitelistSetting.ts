import { BigInt } from '@graphprotocol/graph-ts';
import { AssetWhitelistSetting, Fund, Policy } from '../generated/schema';
import { logCritical } from '../utils/logCritical';

export function assetWhitelistSettingId(fundId: string, policy: Policy): string {
  return fundId + '/' + policy.id;
}

export function useAssetWhitelistSetting(fund: Fund, policy: Policy): AssetWhitelistSetting {
  let id = assetWhitelistSettingId(fund.id, policy);
  let setting = AssetWhitelistSetting.load(id) as AssetWhitelistSetting;

  if (setting == null) {
    logCritical('Failed to load AssetWhitelistSetting {}.', [id]);
  }

  return setting as AssetWhitelistSetting;
}

export function ensureAssetWhitelistSetting(fundId: string, policy: Policy): AssetWhitelistSetting {
  let id = assetWhitelistSettingId(fundId, policy);
  let setting = AssetWhitelistSetting.load(id) as AssetWhitelistSetting;

  if (setting) {
    return setting;
  }

  setting = new AssetWhitelistSetting(id);
  setting.policy = policy.id;
  setting.fund = fundId;
  setting.listed = [];
  setting.events = [];
  setting.timestamp = BigInt.fromI32(0);
  setting.save();

  return setting;
}
