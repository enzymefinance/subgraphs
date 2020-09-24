import { BigInt } from '@graphprotocol/graph-ts';
import { AdapterWhitelistSetting, Fund, Policy } from '../generated/schema';
import { logCritical } from '../utils/logCritical';

export function adapterWhitelistSettingId(fundId: string, policy: Policy): string {
  return fundId + '/' + policy.id;
}

export function useAdapterWhitelistSetting(fund: Fund, policy: Policy): AdapterWhitelistSetting {
  let id = adapterWhitelistSettingId(fund.id, policy);
  let setting = AdapterWhitelistSetting.load(id) as AdapterWhitelistSetting;

  if (setting == null) {
    logCritical('Failed to load AdapterWhitelistSetting {}.', [id]);
  }

  return setting as AdapterWhitelistSetting;
}

export function ensureAdapterWhitelistSetting(fundId: string, policy: Policy): AdapterWhitelistSetting {
  let id = adapterWhitelistSettingId(fundId, policy);
  let setting = AdapterWhitelistSetting.load(id) as AdapterWhitelistSetting;

  if (setting) {
    return setting;
  }

  setting = new AdapterWhitelistSetting(id);
  setting.policy = policy.id;
  setting.fund = fundId;
  setting.listed = [];
  setting.events = [];
  setting.timestamp = BigInt.fromI32(0);
  setting.save();

  return setting;
}