import { BigInt } from '@graphprotocol/graph-ts';
import { AdapterBlacklistSetting, Fund, Policy } from '../generated/schema';
import { logCritical } from '../utils/logCritical';

export function adapterBlacklistSettingId(fundId: string, policy: Policy): string {
  return fundId + '/' + policy.id;
}

export function useAdapterBlacklistSetting(fund: Fund, policy: Policy): AdapterBlacklistSetting {
  let id = adapterBlacklistSettingId(fund.id, policy);
  let setting = AdapterBlacklistSetting.load(id) as AdapterBlacklistSetting;

  if (setting == null) {
    logCritical('Failed to load AdapterBlacklistSetting {}.', [id]);
  }

  return setting as AdapterBlacklistSetting;
}

export function ensureAdapterBlacklistSetting(fundId: string, policy: Policy): AdapterBlacklistSetting {
  let id = adapterBlacklistSettingId(fundId, policy);
  let setting = AdapterBlacklistSetting.load(id) as AdapterBlacklistSetting;

  if (setting) {
    return setting;
  }

  setting = new AdapterBlacklistSetting(id);
  setting.policy = policy.id;
  setting.fund = fundId;
  setting.listed = [];
  setting.events = [];
  setting.timestamp = BigInt.fromI32(0);
  setting.save();

  return setting;
}
