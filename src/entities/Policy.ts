import { Address } from '@graphprotocol/graph-ts';
import { IPolicyInterface } from '../generated/IPolicyInterface';
import { Policy } from '../generated/schema';
import { logCritical } from '../utils/logCritical';

export function usePolicy(id: string): Policy {
  let policy = Policy.load(id) as Policy;
  if (policy == null) {
    logCritical('Failed to load policy {}.', [id]);
  }

  return policy;
}

export function ensurePolicy(address: Address): Policy {
  let policy = Policy.load(address.toHex()) as Policy;
  if (policy) {
    return policy;
  }

  let contract = IPolicyInterface.bind(address);
  let identifier = contract.identifier();

  policy = new Policy(address.toHex());
  policy.identifier = identifier;
  policy.funds = new Array<string>();
  policy.save();

  return policy;
}
