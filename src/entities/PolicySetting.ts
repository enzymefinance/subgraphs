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

export function trackPolicySettingEnabled(fundId: string, policy: Policy): void {
  let policySetting = ensurePolicySetting(fundId, policy);

  policySetting.enabled = true;
  policySetting.save(policy.identifier);
}

export function trackPolicySettingDisabled(fundId: string, policy: Policy): void {
  let policySetting = ensurePolicySetting(fundId, policy);

  policySetting.enabled = false;
  policySetting.save(policy.identifier);
}

export function ensurePolicySetting(fundId: string, policy: Policy): PolicySetting {
  if (policy.identifier == 'ADAPTER_BLACKLIST') {
    return ensureAdapterBlacklistSetting(fundId, policy) as PolicySetting;
  }

  if (policy.identifier == 'ADAPTER_WHITELIST') {
    return ensureAdapterWhitelistSetting(fundId, policy) as PolicySetting;
  }

  if (policy.identifier == 'ASSET_BLACKLIST') {
    return ensureAssetBlacklistSetting(fundId, policy) as PolicySetting;
  }

  if (policy.identifier == 'ASSET_WHITELIST') {
    return ensureAssetWhitelistSetting(fundId, policy) as PolicySetting;
  }

  if (policy.identifier == 'BUY_SHARES_CALLER_WHITELIST') {
    return ensureBuySharesCallerWhitelistSetting(fundId, policy) as PolicySetting;
  }

  if (policy.identifier == 'GUARANTEED_REDEMPTION') {
    return ensureGuaranteedRedemptionSetting(fundId, policy) as PolicySetting;
  }

  if (policy.identifier == 'INVESTOR_WHITELIST') {
    return ensureInvestorWhitelistSetting(fundId, policy) as PolicySetting;
  }

  if (policy.identifier == 'MAX_CONCENTRATION') {
    return ensureMaxConcentrationSetting(fundId, policy) as PolicySetting;
  }

  if (policy.identifier == 'MIN_MAX_INVESTMENT') {
    return ensureMinMaxInvestmentSetting(fundId, policy) as PolicySetting;
  }

  return ensureUnknownPolicySetting(fundId, policy) as PolicySetting;
}
