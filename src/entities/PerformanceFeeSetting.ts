import { BigDecimal, BigInt } from '@graphprotocol/graph-ts';
import { PerformanceFeeSetting, Fund, Policy, Fee } from '../generated/schema';
import { feeSettingId } from '../utils/feeSettingId';
import { logCritical } from '../utils/logCritical';

export function usePerformanceFeeSetting(fund: Fund, policy: Policy): PerformanceFeeSetting {
  let id = feeSettingId(fund.id, policy);
  let setting = PerformanceFeeSetting.load(id) as PerformanceFeeSetting;

  if (setting == null) {
    logCritical('Failed to load PerformanceFeeSetting {}.', [id]);
  }

  return setting;
}

export function ensurePerformanceFeeSetting(fundId: string, fee: Fee): PerformanceFeeSetting {
  let id = feeSettingId(fundId, fee);
  let setting = PerformanceFeeSetting.load(id) as PerformanceFeeSetting;

  if (setting) {
    return setting;
  }

  setting = new PerformanceFeeSetting(id);
  setting.fee = fee.id;
  setting.fund = fundId;
  setting.rate = BigDecimal.fromString('0');
  setting.period = BigInt.fromI32(0);
  setting.events = [];
  setting.timestamp = BigInt.fromI32(0);
  setting.save();

  return setting;
}
