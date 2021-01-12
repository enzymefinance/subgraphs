import { Address } from '@graphprotocol/graph-ts';
import { IPolicyInterface } from '../generated/IPolicyInterface';
import { Policy } from '../generated/schema';
import { logCritical } from '../utils/logCritical';
import { ensurePolicyManager } from './PolicyManager';

export function usePolicy(id: string): Policy {
  let policy = Policy.load(id) as Policy;
  if (policy == null) {
    logCritical('Failed to load policy {}.', [id]);
  }

  return policy;
}

export function ensurePolicy(address: Address, policyManager: Address): Policy {
  let policy = Policy.load(address.toHex()) as Policy;
  if (policy) {
    return policy;
  }

  let contract = IPolicyInterface.bind(address);
  let identifierCall = contract.try_identifier();
  if (identifierCall.reverted) {
    logCritical('identifier() reverted for {}', [address.toHex()]);
  }

  policy = new Policy(address.toHex());
  policy.policyManager = ensurePolicyManager(policyManager).id;
  policy.identifier = identifierCall.value;
  policy.save();

  return policy;
}
