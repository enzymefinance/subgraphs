import { Address } from '@graphprotocol/graph-ts';
import { ensureManager } from '../entities/Account';
import { ensureContract, useContract } from '../entities/Contract';
import { useFund } from '../entities/Fund';
import { ensurePolicy, usePolicy } from '../entities/Policy';
import { ensureTransaction } from '../entities/Transaction';
import { PolicyDeregistered, PolicyEnabledForFund, PolicyRegistered } from '../generated/PolicyManagerContract';
import { PolicyDeregisteredEvent, PolicyEnabledForFundEvent, PolicyRegisteredEvent } from '../generated/schema';
import { arrayUnique } from '../utils/arrayUnique';
import { genericId } from '../utils/genericId';

export function handlePolicyRegistered(event: PolicyRegistered): void {
  let id = genericId(event);
  let registration = new PolicyRegisteredEvent(id);

  registration.timestamp = event.block.timestamp;
  registration.transaction = ensureTransaction(event).id;
  registration.contract = ensureContract(event.address, 'PolicyManager', event.block.timestamp).id;
  registration.policy = ensurePolicy(event.params.policy, event.params.identifier.toHex()).id;
  registration.identifier = event.params.identifier.toHex();

  registration.save();
}

export function handlePolicyDeregistered(event: PolicyDeregistered): void {
  let id = genericId(event);
  let deregistration = new PolicyDeregisteredEvent(id);

  deregistration.timestamp = event.block.timestamp;
  deregistration.transaction = ensureTransaction(event).id;
  deregistration.contract = useContract(event.address.toHex()).id;
  deregistration.policy = usePolicy(event.params.policy.toHex()).id;
  deregistration.identifier = event.params.identifier.toHex();

  deregistration.save();
}

export function handlePolicyEnabledForFund(event: PolicyEnabledForFund): void {
  let id = genericId(event);
  let enabled = new PolicyEnabledForFundEvent(id);
  let fund = useFund(event.address.toHex());
  let policy = usePolicy(event.params.policy.toHex());

  policy.funds = arrayUnique<string>(policy.funds.concat([fund.id]));
  policy.save();

  enabled.fund = fund.id;
  enabled.account = ensureManager(Address.fromString(fund.manager)).id;
  enabled.timestamp = event.block.timestamp;
  enabled.transaction = ensureTransaction(event).id;
  enabled.contract = useContract(event.address.toHex()).id;
  enabled.policy = policy.id;
  enabled.save();

  fund.policies = arrayUnique<string>(fund.policies.concat([policy.id]));
  fund.save();
}
