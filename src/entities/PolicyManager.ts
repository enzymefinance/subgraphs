import { Address } from '@graphprotocol/graph-ts';
import { PolicyManager } from '../generated/schema';

export function ensurePolicyManager(address: Address): PolicyManager {
  let policyManager = PolicyManager.load(address.toHex()) as PolicyManager;
  if (policyManager) {
    return policyManager;
  }

  policyManager = new PolicyManager(address.toHex());
  policyManager.save();

  return policyManager;
}
