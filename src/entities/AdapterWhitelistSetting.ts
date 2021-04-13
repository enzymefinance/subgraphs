import { BigInt } from '@graphprotocol/graph-ts';
import { AdapterWhitelistSetting, Policy } from '../generated/schema';
import { policySettingId } from './PolicySetting';

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
  setting.enabled = true;
  setting.save();

  return setting;
}
