import { BigInt } from '@graphprotocol/graph-ts';
import { AssetWhitelistSetting, Policy } from '../generated/schema';
import { policySettingId } from './PolicySetting';

export function ensureAssetWhitelistSetting(comptrollerProxyId: string, policy: Policy): AssetWhitelistSetting {
  let id = policySettingId(comptrollerProxyId, policy);
  let setting = AssetWhitelistSetting.load(id) as AssetWhitelistSetting;

  if (setting) {
    return setting;
  }

  setting = new AssetWhitelistSetting(id);
  setting.policy = policy.id;
  setting.comptroller = comptrollerProxyId;
  setting.listed = new Array<string>();
  setting.assets = new Array<string>();
  setting.events = new Array<string>();
  setting.timestamp = BigInt.fromI32(0);
  setting.enabled = true;
  setting.save();

  return setting;
}
