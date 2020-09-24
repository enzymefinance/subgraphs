import { BigInt } from '@graphprotocol/graph-ts';
import { InvestorWhitelistSetting, Fund, Policy } from '../generated/schema';
import { logCritical } from '../utils/logCritical';

export function investorWhitelistSettingId(fundId: string, policy: Policy): string {
  return fundId + '/' + policy.id;
}

export function useInvestorWhitelistSetting(fund: Fund, policy: Policy): InvestorWhitelistSetting {
  let id = investorWhitelistSettingId(fund.id, policy);
  let setting = InvestorWhitelistSetting.load(id) as InvestorWhitelistSetting;

  if (setting == null) {
    logCritical('Failed to load InvestorWhitelistSetting {}.', [id]);
  }

  return setting as InvestorWhitelistSetting;
}

export function ensureInvestorWhitelistSetting(fundId: string, policy: Policy): InvestorWhitelistSetting {
  let id = investorWhitelistSettingId(fundId, policy);
  let setting = InvestorWhitelistSetting.load(id) as InvestorWhitelistSetting;

  if (setting) {
    return setting;
  }

  setting = new InvestorWhitelistSetting(id);
  setting.policy = policy.id;
  setting.fund = fundId;
  setting.listed = [];
  setting.events = [];
  setting.timestamp = BigInt.fromI32(0);
  setting.save();

  return setting;
}
