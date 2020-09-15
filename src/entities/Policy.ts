import { Policy } from '../generated/schema';
import { logCritical } from '../utils/logCritical';
import { Address } from '@graphprotocol/graph-ts';
import { IPolicyInterface } from '../generated/IPolicyInterface';

export function usePolicy(id: string): Policy {
  let policy = Policy.load(id);
  if (policy == null) {
    logCritical('Failed to load asset {}.', [id]);
  }

  return policy as Policy;
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
  policy.funds = [];
  policy.save();

  return policy;
}
