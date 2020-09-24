import { BigInt } from '@graphprotocol/graph-ts';
import { AdapterBlacklistSetting, Fund, Policy } from '../generated/schema';
import { arrayUnique } from '../utils/arrayUnique';
import { logCritical } from '../utils/logCritical';

export function adapterBlacklistSettingId(fund: Fund, policy: Policy): string {
  return fund.id + '/' + policy.id;
}

export function useAdapterBlacklistSetting(fund: Fund, policy: Policy): AdapterBlacklistSetting {
  let id = adapterBlacklistSettingId(fund, policy);
  let setting = AdapterBlacklistSetting.load(id) as AdapterBlacklistSetting;

  if (setting == null) {
    logCritical('Failed to load AdapterBlacklistSetting {}.', [id]);
  }

  return setting as AdapterBlacklistSetting;
}

export function ensureAdapterBlacklistSetting(fund: Fund, policy: Policy): AdapterBlacklistSetting {
  let id = adapterBlacklistSettingId(fund, policy);
  let setting = AdapterBlacklistSetting.load(id) as AdapterBlacklistSetting;

  if (setting) {
    return setting;
  }

  setting = new AdapterBlacklistSetting(id);
  setting.policy = policy.id;
  setting.fund = fund.id;
  setting.blacklisted = [];
  setting.events = [];
  setting.timestamp = BigInt.fromI32(0);
  setting.save();

  fund.policySettings = arrayUnique<string>(fund.policySettings.concat([id]));
  fund.save();

  return setting;
}
