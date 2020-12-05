import { Address } from '@graphprotocol/graph-ts';
import { PolicyManager } from '../generated/schema';
import { logCritical } from '../utils/logCritical';

export function usePolicyManager(id: string): PolicyManager {
  let policyManager = PolicyManager.load(id) as PolicyManager;
  if (policyManager == null) {
    logCritical('Failed to load PolicyManager {}.', [id]);
  }

  return policyManager;
}

export function ensurePolicyManager(address: Address): PolicyManager {
  let policyManager = PolicyManager.load(address.toHex()) as PolicyManager;
  if (policyManager) {
    return policyManager;
  }

  policyManager = new PolicyManager(address.toHex());
  policyManager.save();

  return policyManager;
}
