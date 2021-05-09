import { Address } from '@graphprotocol/graph-ts';
import { MinMaxInvestmentContract } from '../generated/MinMaxInvestmentContract';
import { Policy } from '../generated/schema';
import { logCritical } from '../utils/logCritical';
import { ensurePolicyManager } from './PolicyManager';

export function ensurePolicy(address: Address): Policy {
  let policy = Policy.load(address.toHex()) as Policy;
  if (policy) {
    return policy;
  }

  // mis-using MinMaxInvestmentContract, because IPolicyInterface doesn't have getPolicyManager()
  let contract = MinMaxInvestmentContract.bind(address);
  let identifierCall = contract.try_identifier();
  if (identifierCall.reverted) {
    logCritical('identifier() reverted for {}', [address.toHex()]);
  }

  let policyManagerCall = contract.try_getPolicyManager();
  if (policyManagerCall.reverted) {
    logCritical('getPolicy() reverted', []);
  }

  policy = new Policy(address.toHex());
  policy.policyManager = ensurePolicyManager(policyManagerCall.value).id;
  policy.identifier = identifierCall.value;
  policy.save();

  return policy;
}
