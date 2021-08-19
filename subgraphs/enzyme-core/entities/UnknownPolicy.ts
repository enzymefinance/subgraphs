import { Address, ethereum } from '@graphprotocol/graph-ts';
import { UnknownPolicy } from '../generated/schema';
import { policyId } from './Policy';

export function ensureUnknownPolicy(
  comptrollerAddress: Address,
  policyAddress: Address,
  event: ethereum.Event,
): UnknownPolicy {
  let id = policyId(comptrollerAddress, policyAddress);
  let policy = UnknownPolicy.load(id) as UnknownPolicy;

  if (policy) {
    return policy;
  }

  policy = new UnknownPolicy(id);
  policy.policy = policyAddress.toHex();
  policy.comptroller = comptrollerAddress.toHex();
  policy.createdAt = event.block.timestamp;
  policy.enabled = true;
  policy.settings = '';
  policy.save();

  return policy;
}