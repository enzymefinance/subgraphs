import { BigDecimal, BigInt } from '@graphprotocol/graph-ts';
import { MaxConcentrationSetting, Fund, Policy } from '../generated/schema';
import { logCritical } from '../utils/logCritical';
import { policySettingId } from '../utils/policySettingId';

export function useMaxConcentrationSetting(fund: Fund, policy: Policy): MaxConcentrationSetting {
  let id = policySettingId(fund.id, policy);
  let setting = MaxConcentrationSetting.load(id) as MaxConcentrationSetting;

  if (setting == null) {
    logCritical('Failed to load MaxConcentrationSetting {}.', [id]);
  }

  return setting;
}

export function ensureMaxConcentrationSetting(fundId: string, policy: Policy): MaxConcentrationSetting {
  let id = policySettingId(fundId, policy);
  let setting = MaxConcentrationSetting.load(id) as MaxConcentrationSetting;

  if (setting) {
    return setting;
  }

  setting = new MaxConcentrationSetting(id);
  setting.policy = policy.id;
  setting.fund = fundId;
  setting.maxConcentration = BigDecimal.fromString('0');
  setting.events = new Array<string>();
  setting.timestamp = BigInt.fromI32(0);
  setting.save();

  return setting;
}
