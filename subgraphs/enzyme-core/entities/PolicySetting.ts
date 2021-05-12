import { Policy } from '../generated/schema';
import { ensureAdapterBlacklistSetting } from './AdapterBlacklistSetting';
import { ensureAdapterWhitelistSetting } from './AdapterWhitelistSetting';
import { ensureAssetBlacklistSetting } from './AssetBlacklistSetting';
import { ensureAssetWhitelistSetting } from './AssetWhitelistSetting';
import { ensureBuySharesCallerWhitelistSetting } from './BuySharesCallerWhitelistSetting';
import { ensureGuaranteedRedemptionSetting } from './GuaranteedRedemptionSetting';
import { ensureInvestorWhitelistSetting } from './InvestorWhitelistSetting';
import { ensureMaxConcentrationSetting } from './MaxConcentrationSetting';
import { ensureMinMaxInvestmentSetting } from './MinMaxInvestmentSetting';
import { PolicySetting } from './PolicySettingEntity';
import { ensureUnknownPolicySetting } from './UnknownPolicySetting';

export function policySettingId(comptrollerProxyId: string, policy: Policy): string {
  return comptrollerProxyId + '/' + policy.id;
}

export function trackPolicySettingEnabled(comptrollerProxyId: string, policy: Policy): void {
  let policySetting = ensurePolicySetting(comptrollerProxyId, policy);

  policySetting.enabled = true;
  policySetting.save(policy.identifier);
}

export function trackPolicySettingDisabled(comptrollerProxyId: string, policy: Policy): void {
  let policySetting = ensurePolicySetting(comptrollerProxyId, policy);

  policySetting.enabled = false;
  policySetting.save(policy.identifier);
}

export function ensurePolicySetting(comptrollerProxyId: string, policy: Policy): PolicySetting {
  if (policy.identifier == 'ADAPTER_BLACKLIST') {
    return ensureAdapterBlacklistSetting(comptrollerProxyId, policy) as PolicySetting;
  }

  if (policy.identifier == 'ADAPTER_WHITELIST') {
    return ensureAdapterWhitelistSetting(comptrollerProxyId, policy) as PolicySetting;
  }

  if (policy.identifier == 'ASSET_BLACKLIST') {
    return ensureAssetBlacklistSetting(comptrollerProxyId, policy) as PolicySetting;
  }

  if (policy.identifier == 'ASSET_WHITELIST') {
    return ensureAssetWhitelistSetting(comptrollerProxyId, policy) as PolicySetting;
  }

  if (policy.identifier == 'BUY_SHARES_CALLER_WHITELIST') {
    return ensureBuySharesCallerWhitelistSetting(comptrollerProxyId, policy) as PolicySetting;
  }

  if (policy.identifier == 'GUARANTEED_REDEMPTION') {
    return ensureGuaranteedRedemptionSetting(comptrollerProxyId, policy) as PolicySetting;
  }

  if (policy.identifier == 'INVESTOR_WHITELIST') {
    return ensureInvestorWhitelistSetting(comptrollerProxyId, policy) as PolicySetting;
  }

  if (policy.identifier == 'MAX_CONCENTRATION') {
    return ensureMaxConcentrationSetting(comptrollerProxyId, policy) as PolicySetting;
  }

  if (policy.identifier == 'MIN_MAX_INVESTMENT') {
    return ensureMinMaxInvestmentSetting(comptrollerProxyId, policy) as PolicySetting;
  }

  return ensureUnknownPolicySetting(comptrollerProxyId, policy) as PolicySetting;
}
