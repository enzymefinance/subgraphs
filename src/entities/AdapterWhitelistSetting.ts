import { BigInt } from '@graphprotocol/graph-ts';
import { AdapterWhitelistSetting, Fund, Policy } from '../generated/schema';
import { logCritical } from '../utils/logCritical';
import { policySettingId } from '../utils/policySettingId';

export function useAdapterWhitelistSetting(fund: Fund, policy: Policy): AdapterWhitelistSetting {
  let id = policySettingId(fund.id, policy);
  let setting = AdapterWhitelistSetting.load(id) as AdapterWhitelistSetting;

  if (setting == null) {
    logCritical('Failed to load AdapterWhitelistSetting {}.', [id]);
  }

  return setting;
}

export function ensureAdapterWhitelistSetting(fundId: string, policy: Policy): AdapterWhitelistSetting {
  let id = policySettingId(fundId, policy);
  let setting = AdapterWhitelistSetting.load(id) as AdapterWhitelistSetting;

  if (setting) {
    return setting;
  }

  setting = new AdapterWhitelistSetting(id);
  setting.policy = policy.id;
  setting.fund = fundId;
  setting.listed = new Array<string>();
  setting.adapters = new Array<string>();
  setting.events = new Array<string>();
  setting.timestamp = BigInt.fromI32(0);
  setting.save();

  return setting;
}
