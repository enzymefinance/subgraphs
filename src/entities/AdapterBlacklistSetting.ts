import { BigInt } from '@graphprotocol/graph-ts';
import { AdapterBlacklistSetting, Fund, Policy } from '../generated/schema';
import { logCritical } from '../utils/logCritical';
import { policySettingId } from './PolicySetting';

export function useAdapterBlacklistSetting(fund: Fund, policy: Policy): AdapterBlacklistSetting {
  let id = policySettingId(fund.id, policy);
  let setting = AdapterBlacklistSetting.load(id) as AdapterBlacklistSetting;

  if (setting == null) {
    logCritical('Failed to load AdapterBlacklistSetting {}.', [id]);
  }

  return setting;
}

export function ensureAdapterBlacklistSetting(fundId: string, policy: Policy): AdapterBlacklistSetting {
  let id = policySettingId(fundId, policy);
  let setting = AdapterBlacklistSetting.load(id) as AdapterBlacklistSetting;

  if (setting) {
    return setting;
  }

  setting = new AdapterBlacklistSetting(id);
  setting.policy = policy.id;
  setting.fund = fundId;
  setting.listed = new Array<string>();
  setting.adapters = new Array<string>();
  setting.events = new Array<string>();
  setting.timestamp = BigInt.fromI32(0);
  setting.enabled = true;
  setting.save();

  return setting;
}
