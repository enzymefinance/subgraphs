import { BigDecimal, BigInt } from '@graphprotocol/graph-ts';
import { MaxConcentrationSetting, Policy } from '../generated/schema';
import { policySettingId } from './PolicySetting';

export function ensureMaxConcentrationSetting(comptrollerProxyId: string, policy: Policy): MaxConcentrationSetting {
  let id = policySettingId(comptrollerProxyId, policy);
  let setting = MaxConcentrationSetting.load(id) as MaxConcentrationSetting;

  if (setting) {
    return setting;
  }

  setting = new MaxConcentrationSetting(id);
  setting.policy = policy.id;
  setting.comptroller = comptrollerProxyId;
  setting.maxConcentration = BigDecimal.fromString('0');
  setting.events = new Array<string>();
  setting.timestamp = BigInt.fromI32(0);
  setting.enabled = true;
  setting.save();

  return setting;
}
