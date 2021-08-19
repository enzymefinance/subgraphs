import { ensureAdapterBlacklistPolicy } from '../../entities/AdapterBlacklistPolicy';
import { ensureAdapterWhitelistPolicy } from '../../entities/AdapterWhitelistPolicy';
import { ensureAssetBlacklistPolicy } from '../../entities/AssetBlacklistPolicy';
import { ensureAssetWhitelistPolicy } from '../../entities/AssetWhitelistPolicy';
import { ensureBuySharesCallerWhitelistPolicy } from '../../entities/BuySharesCallerWhitelistPolicy';
import { ensureGuaranteedRedemptionPolicy } from '../../entities/GuaranteedRedemptionPolicy';
import { ensureInvestorWhitelistPolicy } from '../../entities/InvestorWhitelistPolicy';
import { ensureMaxConcentrationPolicy } from '../../entities/MaxConcentrationPolicy';
import { ensureMinMaxInvestmentPolicy } from '../../entities/MinMaxInvestmentPolicy';
import { ensureUnknownPolicy } from '../../entities/UnknownPolicy';
import { release2Addresses } from '../../generated/addresses';
import {
  PolicyDeregistered,
  PolicyDisabledForFund,
  PolicyEnabledForFund,
  PolicyRegistered,
} from '../../generated/PolicyManager2Contract';

export function handlePolicyEnabledForFund(event: PolicyEnabledForFund): void {
  let comptrollerAddress = event.params.comptrollerProxy;
  let policyAddress = event.params.policy;

  if (event.params.policy.equals(release2Addresses.adapterBlacklistAddress)) {
    let policy = ensureAdapterBlacklistPolicy(comptrollerAddress, policyAddress, event);
    policy.enabled = true;
    policy.settings = event.params.settingsData.toHex();
    policy.save();
    return;
  }

  if (event.params.policy.equals(release2Addresses.adapterWhitelistAddress)) {
    let policy = ensureAdapterWhitelistPolicy(comptrollerAddress, policyAddress, event);
    policy.enabled = true;
    policy.settings = event.params.settingsData.toHex();
    policy.save();
    return;
  }

  if (event.params.policy.equals(release2Addresses.assetBlacklistAddress)) {
    let policy = ensureAssetBlacklistPolicy(comptrollerAddress, policyAddress, event);
    policy.enabled = true;
    policy.settings = event.params.settingsData.toHex();
    policy.save();
    return;
  }

  if (event.params.policy.equals(release2Addresses.assetWhitelistAddress)) {
    let policy = ensureAssetWhitelistPolicy(comptrollerAddress, policyAddress, event);
    policy.enabled = true;
    policy.settings = event.params.settingsData.toHex();
    policy.save();
    return;
  }

  if (event.params.policy.equals(release2Addresses.buySharesCallerWhitelistAddress)) {
    let policy = ensureBuySharesCallerWhitelistPolicy(comptrollerAddress, policyAddress, event);
    policy.enabled = true;
    policy.settings = event.params.settingsData.toHex();
    policy.save();
    return;
  }

  if (event.params.policy.equals(release2Addresses.guaranteedRedemptionAddress)) {
    let policy = ensureGuaranteedRedemptionPolicy(comptrollerAddress, policyAddress, event);
    policy.enabled = true;
    policy.settings = event.params.settingsData.toHex();
    policy.save();
    return;
  }

  if (event.params.policy.equals(release2Addresses.investorWhitelistAddress)) {
    let policy = ensureInvestorWhitelistPolicy(comptrollerAddress, policyAddress, event);
    policy.enabled = true;
    policy.settings = event.params.settingsData.toHex();
    policy.save();
    return;
  }

  if (event.params.policy.equals(release2Addresses.maxConcentrationAddress)) {
    let policy = ensureMaxConcentrationPolicy(comptrollerAddress, policyAddress, event);
    policy.enabled = true;
    policy.settings = event.params.settingsData.toHex();
    policy.save();
    return;
  }

  if (event.params.policy.equals(release2Addresses.minMaxInvestmentAddress)) {
    let policy = ensureMinMaxInvestmentPolicy(comptrollerAddress, policyAddress, event);
    policy.enabled = true;
    policy.settings = event.params.settingsData.toHex();
    policy.save();
    return;
  }

  let policy = ensureUnknownPolicy(comptrollerAddress, policyAddress, event);
  policy.enabled = true;
  policy.settings = event.params.settingsData.toHex();
  policy.save();
}

export function handlePolicyDisabledForFund(event: PolicyDisabledForFund): void {
  let comptrollerAddress = event.params.comptrollerProxy;
  let policyAddress = event.params.policy;

  if (event.params.policy.equals(release2Addresses.adapterBlacklistAddress)) {
    let policy = ensureAdapterBlacklistPolicy(comptrollerAddress, policyAddress, event);
    policy.enabled = false;
    policy.save();
    return;
  }

  if (event.params.policy.equals(release2Addresses.adapterWhitelistAddress)) {
    let policy = ensureAdapterWhitelistPolicy(comptrollerAddress, policyAddress, event);
    policy.enabled = false;
    policy.save();
    return;
  }

  if (event.params.policy.equals(release2Addresses.assetBlacklistAddress)) {
    let policy = ensureAssetBlacklistPolicy(comptrollerAddress, policyAddress, event);
    policy.enabled = false;
    policy.save();
    return;
  }

  if (event.params.policy.equals(release2Addresses.assetWhitelistAddress)) {
    let policy = ensureAssetWhitelistPolicy(comptrollerAddress, policyAddress, event);
    policy.enabled = false;
    policy.save();
    return;
  }

  if (event.params.policy.equals(release2Addresses.buySharesCallerWhitelistAddress)) {
    let policy = ensureBuySharesCallerWhitelistPolicy(comptrollerAddress, policyAddress, event);
    policy.enabled = false;
    policy.save();
    return;
  }

  if (event.params.policy.equals(release2Addresses.guaranteedRedemptionAddress)) {
    let policy = ensureGuaranteedRedemptionPolicy(comptrollerAddress, policyAddress, event);
    policy.enabled = false;
    policy.save();
    return;
  }

  if (event.params.policy.equals(release2Addresses.investorWhitelistAddress)) {
    let policy = ensureInvestorWhitelistPolicy(comptrollerAddress, policyAddress, event);
    policy.enabled = false;
    policy.save();
    return;
  }

  if (event.params.policy.equals(release2Addresses.maxConcentrationAddress)) {
    let policy = ensureMaxConcentrationPolicy(comptrollerAddress, policyAddress, event);
    policy.enabled = false;
    policy.save();
    return;
  }

  if (event.params.policy.equals(release2Addresses.minMaxInvestmentAddress)) {
    let policy = ensureMinMaxInvestmentPolicy(comptrollerAddress, policyAddress, event);
    policy.enabled = false;
    policy.save();
    return;
  }

  let policy = ensureUnknownPolicy(comptrollerAddress, policyAddress, event);
  policy.enabled = false;
  policy.save();
}

export function handlePolicyRegistered(event: PolicyRegistered): void {}

export function handlePolicyDeregistered(event: PolicyDeregistered): void {}
