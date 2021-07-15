import { ensurePolicy } from '../entities/Policy';
import { trackPolicySettingEnabled, trackPolicySettingDisabled } from '../entities/PolicySetting';
import { ensureTransaction } from '../entities/Transaction';
import {
  PolicyDeregistered,
  PolicyEnabledForFund,
  PolicyDisabledForFund,
  PolicyRegistered,
} from '../generated/PolicyManagerContract';
import {
  PolicyDeregisteredEvent,
  PolicyEnabledForFundEvent,
  PolicyDisabledForFundEvent,
  PolicyRegisteredEvent,
} from '../generated/schema';
import { genericId } from '../utils/genericId';
import { getPolicyHook } from '../utils/getPolicyHook';

export function handlePolicyRegistered(event: PolicyRegistered): void {
  let policy = ensurePolicy(event.params.policy);
  let registration = new PolicyRegisteredEvent(genericId(event));
  registration.timestamp = event.block.timestamp;
  registration.transaction = ensureTransaction(event).id;
  registration.policy = policy.id;
  registration.identifier = event.params.identifier.toHex();
  registration.implementedHooks = event.params.implementedHooks.map<string>((hook) => getPolicyHook(hook));
  registration.save();
}

export function handlePolicyDeregistered(event: PolicyDeregistered): void {
  let deregistration = new PolicyDeregisteredEvent(genericId(event));
  deregistration.timestamp = event.block.timestamp;
  deregistration.transaction = ensureTransaction(event).id;
  deregistration.policy = ensurePolicy(event.params.policy).id;
  deregistration.identifier = event.params.identifier.toHex();
  deregistration.save();
}

export function handlePolicyEnabledForFund(event: PolicyEnabledForFund): void {
  let policy = ensurePolicy(event.params.policy);
  let enabled = new PolicyEnabledForFundEvent(genericId(event));
  enabled.comptroller = event.params.comptrollerProxy.toHex();
  enabled.timestamp = event.block.timestamp;
  enabled.transaction = ensureTransaction(event).id;
  enabled.policy = policy.id;
  enabled.settingsData = event.params.settingsData.toHexString();
  enabled.save();

  trackPolicySettingEnabled(event.params.comptrollerProxy.toHex(), policy);

  // frontend queries need to filter out policies that belong to the current release
}

export function handlePolicyDisabledForFund(event: PolicyDisabledForFund): void {
  let policy = ensurePolicy(event.params.policy);
  let disabled = new PolicyDisabledForFundEvent(genericId(event));
  disabled.comptroller = event.params.comptrollerProxy.toHex();
  disabled.timestamp = event.block.timestamp;
  disabled.transaction = ensureTransaction(event).id;
  disabled.policy = policy.id;
  disabled.save();

  trackPolicySettingDisabled(event.params.comptrollerProxy.toHex(), policy);
}
