import { ensureAdapterBlacklistPolicy } from '../../entities/AdapterBlacklistPolicy';
import { ensureAdapterWhitelistPolicy } from '../../entities/AdapterWhitelistPolicy';
import { ensureAssetBlacklistPolicy } from '../../entities/AssetBlacklistPolicy';
import { ensureAssetWhitelistPolicy } from '../../entities/AssetWhitelistPolicy';
import { ensureBuySharesCallerWhitelistPolicy } from '../../entities/BuySharesCallerWhitelistPolicy';
import { ensureDepositorWhitelistPolicy } from '../../entities/DepositorWhitelistPolicy';
import { ensureGuaranteedRedemptionPolicy } from '../../entities/GuaranteedRedemptionPolicy';
import { ensureMaxConcentrationPolicy } from '../../entities/MaxConcentrationPolicy';
import { ensureMinMaxDepositPolicy } from '../../entities/MinMaxDepositPolicy';
import { ensureUnknownPolicy } from '../../entities/UnknownPolicy';
import { release2Addresses } from '../../generated/addresses';
import {
  PolicyDeregistered,
  PolicyDisabledForFund,
  PolicyEnabledForFund,
  PolicyRegistered,
} from '../../generated/contracts/PolicyManager2Events';

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
    let policy = ensureDepositorWhitelistPolicy(comptrollerAddress, policyAddress, event);
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
    let policy = ensureMinMaxDepositPolicy(comptrollerAddress, policyAddress, event);
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
    let policy = ensureDepositorWhitelistPolicy(comptrollerAddress, policyAddress, event);
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
    let policy = ensureMinMaxDepositPolicy(comptrollerAddress, policyAddress, event);
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
