import { uniqueEventId } from '@enzymefinance/subgraph-utils';
import { ensureAllowedAdapterIncomingAssetsPolicy } from '../../entities/AllowedAdapterIncomingAssetsPolicy';
import { ensureAllowedAdaptersPerManagerPolicy } from '../../entities/AllowedAdaptersPerManagerPolicy';
import { ensureAllowedExternalPositionTypesPerManagerPolicy } from '../../entities/AllowedExternalPositionTypesPerManagerPolicy';
import { ensureAllowedAdaptersPolicy } from '../../entities/AllowedAdaptersPolicy';
import { ensureAllowedAssetsForRedemptionPolicy } from '../../entities/AllowedAssetsForRedemptionPolicy';
import { ensureAllowedDepositRecipientsPolicy } from '../../entities/AllowedDepositRecipientsPolicy';
import { ensureAllowedExternalPositionTypesPolicy } from '../../entities/AllowedExternalPositionTypesPolicy';
import { ensureAllowedSharesTransferRecipientsPolicy } from '../../entities/AllowedSharesTransferRecipientsPolicy';
import { ensureComptroller } from '../../entities/Comptroller';
import { getActivityCounter } from '../../entities/Counter';
import { ensureCumulativeSlippageTolerancePolicy } from '../../entities/CumulativeSlippageTolerancePolicy';
import { ensureMinAssetBalancesPostRedemptionPolicy } from '../../entities/MinAssetBalancesPostRedemptionPolicy';
import { ensureMinMaxDepositPolicy } from '../../entities/MinMaxDepositPolicy';
import { ensureNoDepegOnRedeemSharesForSpecificAssetsPolicy } from '../../entities/NoDepegOnRedeemSharesForSpecificAssetsPolicy';
import { ensureOnlyRemoveDustExternalPositionPolicy } from '../../entities/OnlyRemoveDustExternalPositionPolicy';
import { ensureOnlyUntrackDustOrPricelessAssetsPolicy } from '../../entities/OnlyUntrackDustOrPricelessAssetsPolicy';
import { policyId } from '../../entities/Policy';
import { ensureUnknownPolicy } from '../../entities/UnknownPolicy';
import { release4Addresses } from '../../generated/addresses';
import {
  PolicyDisabledOnHookForFund,
  PolicyEnabledForFund,
  ValidatedVaultProxySetForFund,
} from '../../generated/contracts/PolicyManager4Events';
import { PolicyDisabledForVault, PolicyEnabledForVault } from '../../generated/schema';
import { ensureAllowedRedeemersForSpecificAssetsPolicy } from '../../entities/AllowedRedeemersForSpecificAssetsPolicy';
import { ensureDisallowedAdapterIncomingAssetsPolicy } from '../../entities/DisallowedAdapterIncomingAssetsPolicy';

export function handlePolicyEnabledForFund(event: PolicyEnabledForFund): void {
  let comptrollerAddress = event.params.comptrollerProxy;
  let policyAddress = event.params.policy;

  let comptroller = ensureComptroller(comptrollerAddress, event);
  if (comptroller.vault != null) {
    let policyEnabled = new PolicyEnabledForVault(uniqueEventId(event));
    policyEnabled.timestamp = event.block.timestamp.toI32();
    policyEnabled.vault = comptroller.vault as string;
    policyEnabled.policy = policyId(comptrollerAddress, policyAddress);
    policyEnabled.activityCounter = getActivityCounter();
    policyEnabled.activityType = 'VaultSettings';
    policyEnabled.activityCategories = ['Vault'];
    policyEnabled.save();
  }

  if (event.params.policy.equals(release4Addresses.allowedAdapterIncomingAssetsPolicyAddress)) {
    let policy = ensureAllowedAdapterIncomingAssetsPolicy(comptrollerAddress, policyAddress, event);
    policy.enabled = true;
    policy.settings = event.params.settingsData.toHex();
    policy.save();
    return;
  }

  if (event.params.policy.equals(release4Addresses.allowedAdaptersPerManagerPolicyAddress)) {
    let policy = ensureAllowedAdaptersPerManagerPolicy(comptrollerAddress, policyAddress, event);
    policy.enabled = true;
    policy.settings = event.params.settingsData.toHex();
    policy.save();
    return;
  }

  if (event.params.policy.equals(release4Addresses.allowedAdaptersPolicyAddress)) {
    let policy = ensureAllowedAdaptersPolicy(comptrollerAddress, policyAddress, event);
    policy.enabled = true;
    policy.settings = event.params.settingsData.toHex();
    policy.save();
    return;
  }

  if (event.params.policy.equals(release4Addresses.allowedAssetsForRedemptionPolicyAddress)) {
    let policy = ensureAllowedAssetsForRedemptionPolicy(comptrollerAddress, policyAddress, event);
    policy.enabled = true;
    policy.settings = event.params.settingsData.toHex();
    policy.save();
    return;
  }

  if (event.params.policy.equals(release4Addresses.allowedDepositRecipientsPolicyAddress)) {
    let policy = ensureAllowedDepositRecipientsPolicy(comptrollerAddress, policyAddress, event);
    policy.enabled = true;
    policy.settings = event.params.settingsData.toHex();
    policy.save();
    return;
  }

  if (event.params.policy.equals(release4Addresses.allowedExternalPositionTypesPerManagerPolicyAddress)) {
    let policy = ensureAllowedExternalPositionTypesPerManagerPolicy(comptrollerAddress, policyAddress, event);
    policy.enabled = true;
    policy.settings = event.params.settingsData.toHex();
    policy.save();
    return;
  }

  if (event.params.policy.equals(release4Addresses.allowedExternalPositionTypesPolicyAddress)) {
    let policy = ensureAllowedExternalPositionTypesPolicy(comptrollerAddress, policyAddress, event);
    policy.enabled = true;
    policy.settings = event.params.settingsData.toHex();
    policy.save();
    return;
  }

  if (event.params.policy.equals(release4Addresses.allowedRedeemersForSpecificAssetsPolicyAddress)) {
    let policy = ensureAllowedRedeemersForSpecificAssetsPolicy(comptrollerAddress, policyAddress, event);
    policy.enabled = true;
    policy.settings = event.params.settingsData.toHex();
    policy.save();
    return;
  }

  if (event.params.policy.equals(release4Addresses.allowedSharesTransferRecipientsPolicyAddress)) {
    let policy = ensureAllowedSharesTransferRecipientsPolicy(comptrollerAddress, policyAddress, event);
    policy.enabled = true;
    policy.settings = event.params.settingsData.toHex();
    policy.save();
    return;
  }

  if (event.params.policy.equals(release4Addresses.cumulativeSlippageTolerancePolicyAddress)) {
    let policy = ensureCumulativeSlippageTolerancePolicy(comptrollerAddress, policyAddress, event);
    policy.enabled = true;
    policy.settings = event.params.settingsData.toHex();
    policy.save();
    return;
  }

  if (event.params.policy.equals(release4Addresses.disallowedAdapterIncomingAssetsPolicyAddress)) {
    let policy = ensureDisallowedAdapterIncomingAssetsPolicy(comptrollerAddress, policyAddress, event);
    policy.enabled = true;
    policy.settings = event.params.settingsData.toHex();
    policy.save();
    return;
  }

  if (event.params.policy.equals(release4Addresses.minAssetBalancesPostRedemptionPolicyAddress)) {
    let policy = ensureMinAssetBalancesPostRedemptionPolicy(comptrollerAddress, policyAddress, event);
    policy.enabled = true;
    policy.settings = event.params.settingsData.toHex();
    policy.save();
    return;
  }

  if (event.params.policy.equals(release4Addresses.minMaxInvestmentPolicyAddress)) {
    let policy = ensureMinMaxDepositPolicy(comptrollerAddress, policyAddress, event);
    policy.enabled = true;
    policy.settings = event.params.settingsData.toHex();
    policy.save();
    return;
  }

  if (event.params.policy.equals(release4Addresses.noDepegOnRedeemSharesForSpecificAssetsPolicyAddress)) {
    let policy = ensureNoDepegOnRedeemSharesForSpecificAssetsPolicy(comptrollerAddress, policyAddress, event);
    policy.enabled = true;
    policy.settings = event.params.settingsData.toHex();
    policy.save();
    return;
  }

  if (event.params.policy.equals(release4Addresses.onlyRemoveDustExternalPositionPolicyAddress)) {
    let policy = ensureOnlyRemoveDustExternalPositionPolicy(comptrollerAddress, policyAddress, event);
    policy.enabled = true;
    policy.settings = event.params.settingsData.toHex();
    policy.save();
    return;
  }

  if (event.params.policy.equals(release4Addresses.onlyUntrackDustOrPricelessAssetsPolicyAddress)) {
    let policy = ensureOnlyUntrackDustOrPricelessAssetsPolicy(comptrollerAddress, policyAddress, event);
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

export function handlePolicyDisabledOnHookForFund(event: PolicyDisabledOnHookForFund): void {
  let comptrollerAddress = event.params.comptrollerProxy;
  let policyAddress = event.params.policy;

  let comptroller = ensureComptroller(comptrollerAddress, event);
  if (comptroller.vault != null) {
    let policyEnabled = new PolicyDisabledForVault(uniqueEventId(event));
    policyEnabled.timestamp = event.block.timestamp.toI32();
    policyEnabled.vault = comptroller.vault as string;
    policyEnabled.policy = policyId(comptrollerAddress, policyAddress);
    policyEnabled.activityCounter = getActivityCounter();
    policyEnabled.activityType = 'VaultSettings';
    policyEnabled.activityCategories = ['Vault'];
    policyEnabled.save();
  }

  if (event.params.policy.equals(release4Addresses.allowedAdapterIncomingAssetsPolicyAddress)) {
    let policy = ensureAllowedAdapterIncomingAssetsPolicy(comptrollerAddress, policyAddress, event);
    policy.enabled = false;
    policy.save();
    return;
  }

  if (event.params.policy.equals(release4Addresses.allowedAdaptersPolicyAddress)) {
    let policy = ensureAllowedAdaptersPolicy(comptrollerAddress, policyAddress, event);
    policy.enabled = false;
    policy.save();
    return;
  }

  if (event.params.policy.equals(release4Addresses.allowedAdaptersPerManagerPolicyAddress)) {
    let policy = ensureAllowedAdaptersPerManagerPolicy(comptrollerAddress, policyAddress, event);
    policy.enabled = false;
    policy.save();
    return;
  }

  if (event.params.policy.equals(release4Addresses.allowedAssetsForRedemptionPolicyAddress)) {
    let policy = ensureAllowedAssetsForRedemptionPolicy(comptrollerAddress, policyAddress, event);
    policy.enabled = false;
    policy.save();
    return;
  }

  if (event.params.policy.equals(release4Addresses.allowedDepositRecipientsPolicyAddress)) {
    let policy = ensureAllowedDepositRecipientsPolicy(comptrollerAddress, policyAddress, event);
    policy.enabled = false;
    policy.save();
    return;
  }

  if (event.params.policy.equals(release4Addresses.allowedExternalPositionTypesPolicyAddress)) {
    let policy = ensureAllowedExternalPositionTypesPolicy(comptrollerAddress, policyAddress, event);
    policy.enabled = false;
    policy.save();
    return;
  }

  if (event.params.policy.equals(release4Addresses.allowedExternalPositionTypesPerManagerPolicyAddress)) {
    let policy = ensureAllowedExternalPositionTypesPerManagerPolicy(comptrollerAddress, policyAddress, event);
    policy.enabled = false;
    policy.save();
    return;
  }

  if (event.params.policy.equals(release4Addresses.allowedRedeemersForSpecificAssetsPolicyAddress)) {
    let policy = ensureAllowedRedeemersForSpecificAssetsPolicy(comptrollerAddress, policyAddress, event);
    policy.enabled = false;
    policy.save();
    return;
  }

  if (event.params.policy.equals(release4Addresses.allowedSharesTransferRecipientsPolicyAddress)) {
    let policy = ensureAllowedSharesTransferRecipientsPolicy(comptrollerAddress, policyAddress, event);
    policy.enabled = false;
    policy.save();
    return;
  }

  if (event.params.policy.equals(release4Addresses.cumulativeSlippageTolerancePolicyAddress)) {
    let policy = ensureCumulativeSlippageTolerancePolicy(comptrollerAddress, policyAddress, event);
    policy.enabled = false;
    policy.save();
    return;
  }

  if (event.params.policy.equals(release4Addresses.disallowedAdapterIncomingAssetsPolicyAddress)) {
    let policy = ensureDisallowedAdapterIncomingAssetsPolicy(comptrollerAddress, policyAddress, event);
    policy.enabled = false;
    policy.save();
    return;
  }

  if (event.params.policy.equals(release4Addresses.minAssetBalancesPostRedemptionPolicyAddress)) {
    let policy = ensureMinAssetBalancesPostRedemptionPolicy(comptrollerAddress, policyAddress, event);
    policy.enabled = false;
    policy.save();
    return;
  }

  if (event.params.policy.equals(release4Addresses.minMaxInvestmentPolicyAddress)) {
    let policy = ensureMinMaxDepositPolicy(comptrollerAddress, policyAddress, event);
    policy.enabled = false;
    policy.save();
    return;
  }

  if (event.params.policy.equals(release4Addresses.noDepegOnRedeemSharesForSpecificAssetsPolicyAddress)) {
    let policy = ensureNoDepegOnRedeemSharesForSpecificAssetsPolicy(comptrollerAddress, policyAddress, event);
    policy.enabled = false;
    policy.save();
    return;
  }

  if (event.params.policy.equals(release4Addresses.onlyRemoveDustExternalPositionPolicyAddress)) {
    let policy = ensureOnlyRemoveDustExternalPositionPolicy(comptrollerAddress, policyAddress, event);
    policy.enabled = false;
    policy.save();
    return;
  }

  if (event.params.policy.equals(release4Addresses.onlyUntrackDustOrPricelessAssetsPolicyAddress)) {
    let policy = ensureOnlyUntrackDustOrPricelessAssetsPolicy(comptrollerAddress, policyAddress, event);
    policy.enabled = false;
    policy.save();
    return;
  }

  let policy = ensureUnknownPolicy(comptrollerAddress, policyAddress, event);
  policy.enabled = false;
  policy.save();
}

export function handleValidatedVaultProxySetForFund(event: ValidatedVaultProxySetForFund): void {}
