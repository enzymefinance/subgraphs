import { ensureAllowedAdapterIncomingAssetsPolicy } from '../../entities/AllowedAdapterIncomingAssetsPolicy';
import { ensureAllowedAdaptersPolicy } from '../../entities/AllowedAdaptersPolicy';
import { ensureAllowedAssetsForRedemptionPolicy } from '../../entities/AllowedAssetsForRedemptionPolicy';
import { ensureAllowedDepositRecipientsPolicy } from '../../entities/AllowedDepositRecipientsPolicy';
import { ensureAllowedExternalPositionTypesPolicy } from '../../entities/AllowedExternalPositionTypesPolicy';
import { ensureAllowedSharesTransferRecipientsPolicy } from '../../entities/AllowedSharesTransferRecipientsPolicy';
import { ensureCumulativeSlippageTolerancePolicy } from '../../entities/CumulativeSlippageTolerancePolicy';
import { ensureGuaranteedRedemptionPolicy } from '../../entities/GuaranteedRedemptionPolicy';
import { ensureMinAssetBalancesPostRedemptionPolicy } from '../../entities/MinAssetBalancesPostRedemptionPolicy';
import { ensureMinMaxDepositPolicy } from '../../entities/MinMaxDepositPolicy';
import { ensureOnlyRemoveDustExternalPositionPolicy } from '../../entities/OnlyRemoveDustExternalPositionPolicy';
import { ensureOnlyUntrackDustOrPricelessAssetsPolicy } from '../../entities/OnlyUntrackDustOrPricelessAssetsPolicy';
import { ensureUnknownPolicy } from '../../entities/UnknownPolicy';
import { release4Addresses } from '../../generated/addresses';
import { PolicyDisabledForFund, PolicyEnabledForFund } from '../../generated/contracts/PolicyManager4Events';

export function handlePolicyEnabledForFund(event: PolicyEnabledForFund): void {
  let comptrollerAddress = event.params.comptrollerProxy;
  let policyAddress = event.params.policy;

  if (event.params.policy.equals(release4Addresses.allowedAdapterIncomingAssetsPolicyAddress)) {
    let policy = ensureAllowedAdapterIncomingAssetsPolicy(comptrollerAddress, policyAddress, event);
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

  if (event.params.policy.equals(release4Addresses.allowedExternalPositionTypesPolicyAddress)) {
    let policy = ensureAllowedExternalPositionTypesPolicy(comptrollerAddress, policyAddress, event);
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

  if (event.params.policy.equals(release4Addresses.guaranteedRedemptionPolicyAddress)) {
    let policy = ensureGuaranteedRedemptionPolicy(comptrollerAddress, policyAddress, event);
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

export function handlePolicyDisabledForFund(event: PolicyDisabledForFund): void {
  let comptrollerAddress = event.params.comptrollerProxy;
  let policyAddress = event.params.policy;

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

  if (event.params.policy.equals(release4Addresses.guaranteedRedemptionPolicyAddress)) {
    let policy = ensureGuaranteedRedemptionPolicy(comptrollerAddress, policyAddress, event);
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
