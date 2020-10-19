import { BigInt } from '@graphprotocol/graph-ts';
import { InvestorWhitelistSetting, Fund, Policy } from '../generated/schema';
import { logCritical } from '../utils/logCritical';
import { policySettingId } from '../utils/policySettingId';

export function useInvestorWhitelistSetting(fund: Fund, policy: Policy): InvestorWhitelistSetting {
  let id = policySettingId(fund.id, policy);
  let setting = InvestorWhitelistSetting.load(id) as InvestorWhitelistSetting;

  if (setting == null) {
    logCritical('Failed to load InvestorWhitelistSetting {}.', [id]);
  }

  return setting;
}

export function ensureInvestorWhitelistSetting(fundId: string, policy: Policy): InvestorWhitelistSetting {
  let id = policySettingId(fundId, policy);
  let setting = InvestorWhitelistSetting.load(id) as InvestorWhitelistSetting;

  if (setting) {
    return setting;
  }

  setting = new InvestorWhitelistSetting(id);
  setting.policy = policy.id;
  setting.fund = fundId;
  setting.listed = new Array<string>();
  setting.events = new Array<string>();
  setting.timestamp = BigInt.fromI32(0);
  setting.save();

  return setting;
}
