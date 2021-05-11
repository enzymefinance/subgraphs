import { BigDecimal, BigInt } from '@graphprotocol/graph-ts';
import { MinMaxInvestmentSetting, Policy } from '../generated/schema';
import { policySettingId } from './PolicySetting';

export function ensureMinMaxInvestmentSetting(comptrollerProxyId: string, policy: Policy): MinMaxInvestmentSetting {
  let id = policySettingId(comptrollerProxyId, policy);
  let setting = MinMaxInvestmentSetting.load(id) as MinMaxInvestmentSetting;

  if (setting) {
    return setting;
  }

  setting = new MinMaxInvestmentSetting(id);
  setting.policy = policy.id;
  setting.comptroller = comptrollerProxyId;
  setting.minInvestmentAmount = BigDecimal.fromString('0');
  setting.maxInvestmentAmount = BigDecimal.fromString('0');
  setting.events = new Array<string>();
  setting.timestamp = BigInt.fromI32(0);
  setting.enabled = true;
  setting.save();

  return setting;
}
