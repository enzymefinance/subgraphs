import { BigInt } from '@graphprotocol/graph-ts';
import { InvestorWhitelistSetting, Policy } from '../generated/schema';
import { policySettingId } from './PolicySetting';

export function ensureInvestorWhitelistSetting(comptrollerProxyId: string, policy: Policy): InvestorWhitelistSetting {
  let id = policySettingId(comptrollerProxyId, policy);
  let setting = InvestorWhitelistSetting.load(id) as InvestorWhitelistSetting;

  if (setting) {
    return setting;
  }

  setting = new InvestorWhitelistSetting(id);
  setting.policy = policy.id;
  setting.comptroller = comptrollerProxyId;
  setting.listed = new Array<string>();
  setting.events = new Array<string>();
  setting.timestamp = BigInt.fromI32(0);
  setting.enabled = true;
  setting.save();

  return setting;
}
