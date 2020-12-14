import { BigInt } from '@graphprotocol/graph-ts';
import { BuySharesCallerWhitelistSetting, Fund, Policy } from '../generated/schema';
import { logCritical } from '../utils/logCritical';
import { policySettingId } from './PolicySetting';

export function useBuySharesCallerWhitelistSetting(fund: Fund, policy: Policy): BuySharesCallerWhitelistSetting {
  let id = policySettingId(fund.id, policy);
  let setting = BuySharesCallerWhitelistSetting.load(id) as BuySharesCallerWhitelistSetting;

  if (setting == null) {
    logCritical('Failed to load BuySharesCallerWhitelistSetting {}.', [id]);
  }

  return setting;
}

export function ensureBuySharesCallerWhitelistSetting(fundId: string, policy: Policy): BuySharesCallerWhitelistSetting {
  let id = policySettingId(fundId, policy);
  let setting = BuySharesCallerWhitelistSetting.load(id) as BuySharesCallerWhitelistSetting;

  if (setting) {
    return setting;
  }

  setting = new BuySharesCallerWhitelistSetting(id);
  setting.policy = policy.id;
  setting.fund = fundId;
  setting.listed = new Array<string>();
  setting.events = new Array<string>();
  setting.timestamp = BigInt.fromI32(0);
  setting.enabled = true;
  setting.save();

  return setting;
}
