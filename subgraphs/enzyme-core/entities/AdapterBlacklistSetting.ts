import { BigInt } from '@graphprotocol/graph-ts';
import { AdapterBlacklistSetting, Policy } from '../generated/schema';
import { policySettingId } from './PolicySetting';

export function ensureAdapterBlacklistSetting(comptrollerProxyId: string, policy: Policy): AdapterBlacklistSetting {
  let id = policySettingId(comptrollerProxyId, policy);
  let setting = AdapterBlacklistSetting.load(id) as AdapterBlacklistSetting;

  if (setting) {
    return setting;
  }

  setting = new AdapterBlacklistSetting(id);
  setting.policy = policy.id;
  setting.comptroller = comptrollerProxyId;
  setting.listed = new Array<string>();
  setting.adapters = new Array<string>();
  setting.events = new Array<string>();
  setting.timestamp = BigInt.fromI32(0);
  setting.enabled = true;
  setting.save();

  return setting;
}
