import { BigDecimal, BigInt } from '@graphprotocol/graph-ts';
import { PerformanceFeeSetting, Fund, Policy, Fee } from '../generated/schema';
import { logCritical } from '../utils/logCritical';

export function performanceFeeSettingId(fundId: string, fee: Fee): string {
  return fundId + '/' + fee.id;
}

export function usePerformanceFeeSetting(fund: Fund, policy: Policy): PerformanceFeeSetting {
  let id = performanceFeeSettingId(fund.id, policy);
  let setting = PerformanceFeeSetting.load(id) as PerformanceFeeSetting;

  if (setting == null) {
    logCritical('Failed to load PerformanceFeeSetting {}.', [id]);
  }

  return setting as PerformanceFeeSetting;
}

export function ensurePerformanceFeeSetting(fundId: string, fee: Fee): PerformanceFeeSetting {
  let id = performanceFeeSettingId(fundId, fee);
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
