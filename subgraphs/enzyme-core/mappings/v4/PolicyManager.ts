import { ensureAllowedAdapterIncomingAssetsPolicy } from '../../entities/AllowedAdapterIncomingAssetsPolicy';
import { ensureAllowedDepositRecipientsPolicy } from '../../entities/AllowedDepositRecipientsPolicy';
import { ensureGuaranteedRedemptionPolicy } from '../../entities/GuaranteedRedemptionPolicy';
import { ensureMinMaxInvestmentPolicy } from '../../entities/MinMaxInvestmentPolicy';
import { ensureUnknownPolicy } from '../../entities/UnknownPolicy';
import { release4Addresses } from '../../generated/addresses';
import { PolicyDisabledForFund, PolicyEnabledForFund } from '../../generated/PolicyManager4Contract';

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

  if (event.params.policy.equals(release4Addresses.allowedDepositRecipientsPolicyAddress)) {
    let policy = ensureAllowedDepositRecipientsPolicy(comptrollerAddress, policyAddress, event);
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

  if (event.params.policy.equals(release4Addresses.minMaxInvestmentPolicyAddress)) {
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

  if (event.params.policy.equals(release4Addresses.allowedAdapterIncomingAssetsPolicyAddress)) {
    let policy = ensureAllowedAdapterIncomingAssetsPolicy(comptrollerAddress, policyAddress, event);
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

  if (event.params.policy.equals(release4Addresses.guaranteedRedemptionPolicyAddress)) {
    let policy = ensureGuaranteedRedemptionPolicy(comptrollerAddress, policyAddress, event);
    policy.enabled = false;
    policy.save();
    return;
  }

  if (event.params.policy.equals(release4Addresses.minMaxInvestmentPolicyAddress)) {
    let policy = ensureMinMaxInvestmentPolicy(comptrollerAddress, policyAddress, event);
    policy.enabled = false;
    policy.save();
    return;
  }

  let policy = ensureUnknownPolicy(comptrollerAddress, policyAddress, event);
  policy.enabled = false;
  policy.save();
}
