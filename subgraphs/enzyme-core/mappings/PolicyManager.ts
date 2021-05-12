import { uniqueEventId } from '../../../utils/utils/id';
import { ensurePolicy } from '../entities/Policy';
import { trackPolicySettingDisabled, trackPolicySettingEnabled } from '../entities/PolicySetting';
import { ensureTransaction } from '../entities/Transaction';
import { ComptrollerLibContract } from '../generated/ComptrollerLibContract';
import {
  PolicyDeregistered,
  PolicyDisabledForFund,
  PolicyEnabledForFund,
  PolicyRegistered,
} from '../generated/PolicyManagerContract';
import {
  PolicyDeregisteredEvent,
  PolicyDisabledForFundEvent,
  PolicyEnabledForFundEvent,
  PolicyRegisteredEvent,
} from '../generated/schema';
import { policyHook } from '../utils/policyHook';

export function handlePolicyRegistered(event: PolicyRegistered): void {
  let policy = ensurePolicy(event.params.policy);

  let registration = new PolicyRegisteredEvent(uniqueEventId(event));
  registration.timestamp = event.block.timestamp;
  registration.transaction = ensureTransaction(event).id;
  registration.policy = policy.id;
  registration.identifier = event.params.identifier.toHex();
  registration.implementedHooks = event.params.implementedHooks.map<string>((hook) => policyHook(hook));
  registration.save();
}

export function handlePolicyDeregistered(event: PolicyDeregistered): void {
  let deregistration = new PolicyDeregisteredEvent(uniqueEventId(event));
  deregistration.timestamp = event.block.timestamp;
  deregistration.transaction = ensureTransaction(event).id;
  deregistration.policy = ensurePolicy(event.params.policy).id;
  deregistration.identifier = event.params.identifier.toHex();
  deregistration.save();
}

export function handlePolicyEnabledForFund(event: PolicyEnabledForFund): void {
  let comptroller = ComptrollerLibContract.bind(event.params.comptrollerProxy);
  let vaultId = comptroller.getVaultProxy().toHex();
  let policy = ensurePolicy(event.params.policy);

  let enabled = new PolicyEnabledForFundEvent(uniqueEventId(event));
  enabled.vault = vaultId;
  enabled.timestamp = event.block.timestamp;
  enabled.transaction = ensureTransaction(event).id;
  enabled.policy = policy.id;
  enabled.settingsData = event.params.settingsData.toHexString();
  enabled.save();

  trackPolicySettingEnabled(event.params.comptrollerProxy.toHex(), policy);
}

export function handlePolicyDisabledForFund(event: PolicyDisabledForFund): void {
  let comptroller = ComptrollerLibContract.bind(event.params.comptrollerProxy);
  let fundId = comptroller.getVaultProxy().toHex();
  let policy = ensurePolicy(event.params.policy);

  let enabled = new PolicyDisabledForFundEvent(uniqueEventId(event));
  enabled.vault = fundId;
  enabled.timestamp = event.block.timestamp;
  enabled.transaction = ensureTransaction(event).id;
  enabled.policy = policy.id;
  enabled.save();

  trackPolicySettingDisabled(event.params.comptrollerProxy.toHex(), policy);
}
