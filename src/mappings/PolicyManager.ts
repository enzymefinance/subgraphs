import { PolicyDeregistered, PolicyEnabledForFund, PolicyRegistered } from '../generated/PolicyManagerContract';
import { genericId } from '../utils/genericId';
import { useFund } from '../entities/Fund';
import { PolicyRegistration, PolicyDeregistration, PolicyEnabled } from '../generated/schema';
import { ensureTransaction } from '../entities/Transaction';
import { ensureContract } from '../entities/Contract';
import { Address } from '@graphprotocol/graph-ts';
import { ensureManager } from '../entities/Account';
import { ensurePolicy, usePolicy } from '../entities/Policy';
import { arrayUnique } from '../utils/arrayUnique';

export function handlePolicyDeregistered(event: PolicyDeregistered): void {
  let id = genericId(event);
  let deregistration = new PolicyDeregistration(id);
  
  deregistration.timestamp = event.block.timestamp;
  deregistration.transaction = ensureTransaction(event).id;
  deregistration.contract = ensureContract(event.params.policy, 'PolicyManager', event.block.timestamp).id;
  deregistration.policy = usePolicy(event.params.policy.toHex()).id;
  deregistration.identifier = event.params.identifier.toHex()
  
  deregistration.save();
}

export function handlePolicyEnabledForFund(event: PolicyEnabledForFund): void {
  let id = genericId(event);
  let enabled = new PolicyEnabled(id);
  let fund = useFund(event.address.toHex());
  let policy = usePolicy(event.params.policy.toHex())
 
  policy.funds = arrayUnique<string>(policy.funds.concat([fund.id]))
  policy.save()
 
  enabled.fund = fund.id;  enabled.account = ensureManager(Address.fromString(fund.manager)).id;
  enabled.timestamp = event.block.timestamp;
  enabled.transaction = ensureTransaction(event).id;
  enabled.contract = usePolicy(event.params.policy.toHex()).id;
  enabled.policy = policy.id;
  enabled.save();
 
  fund.policies = arrayUnique<string>(fund.policies.concat([enabled.policy]));
  fund.save();
}

export function handlePolicyRegistered(event: PolicyRegistered): void {
  let id = genericId(event);
  let registration = new PolicyRegistration(id);

  registration.timestamp = event.block.timestamp;
  registration.transaction = ensureTransaction(event).id;
  registration.contract = ensureContract(event.address, 'PolicyManager', event.block.timestamp).id;
  registration.policy = ensurePolicy(event.params.policy, event.params.identifier.toHex()).id;
  registration.identifier = event.params.identifier.toHex()
  
  registration.save();
}
