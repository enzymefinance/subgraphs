import { BigInt } from '@graphprotocol/graph-ts';
import { AssetBlacklistSetting, Fund, Policy } from '../generated/schema';
import { logCritical } from '../utils/logCritical';
import { policySettingId } from './PolicySetting';

export function useAssetBlacklistSetting(fund: Fund, policy: Policy): AssetBlacklistSetting {
  let id = policySettingId(fund.id, policy);
  let setting = AssetBlacklistSetting.load(id) as AssetBlacklistSetting;

  if (setting == null) {
    logCritical('Failed to load AssetBlacklistSetting {}.', [id]);
  }

  return setting;
}

export function ensureAssetBlacklistSetting(fundId: string, policy: Policy): AssetBlacklistSetting {
  let id = policySettingId(fundId, policy);
  let setting = AssetBlacklistSetting.load(id) as AssetBlacklistSetting;

  if (setting) {
    return setting;
  }

  setting = new AssetBlacklistSetting(id);
  setting.policy = policy.id;
  setting.fund = fundId;
  setting.listed = new Array<string>();
  setting.assets = new Array<string>();
  setting.events = new Array<string>();
  setting.timestamp = BigInt.fromI32(0);
  setting.enabled = true;
  setting.save();

  return setting;
}
