import { BigInt } from '@graphprotocol/graph-ts';
import { BuySharesCallerWhitelistSetting, Policy } from '../generated/schema';
import { policySettingId } from './PolicySetting';

export function ensureBuySharesCallerWhitelistSetting(
  comptrollerProxyId: string,
  policy: Policy,
): BuySharesCallerWhitelistSetting {
  let id = policySettingId(comptrollerProxyId, policy);
  let setting = BuySharesCallerWhitelistSetting.load(id) as BuySharesCallerWhitelistSetting;

  if (setting) {
    return setting;
  }

  setting = new BuySharesCallerWhitelistSetting(id);
  setting.policy = policy.id;
  setting.comptroller = comptrollerProxyId;
  setting.listed = new Array<string>();
  setting.events = new Array<string>();
  setting.timestamp = BigInt.fromI32(0);
  setting.enabled = true;
  setting.save();

  return setting;
}
