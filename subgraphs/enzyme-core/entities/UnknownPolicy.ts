import { Address, ethereum } from '@graphprotocol/graph-ts';
import { UnknownPolicy } from '../generated/schema';
import { policyId } from './Policy';

export function ensureUnknownPolicy(
  comptrollerAddress: Address,
  policyAddress: Address,
  event: ethereum.Event,
): UnknownPolicy {
  let id = policyId(comptrollerAddress, policyAddress);
  let policy = UnknownPolicy.load(id);

  if (policy) {
    return policy;
  }

  policy = new UnknownPolicy(id);
  policy.policy = policyAddress;
  policy.policyType = 'UnknownPolicy';
  policy.comptroller = comptrollerAddress.toHex();
  policy.createdAt = event.block.timestamp.toI32();
  policy.enabled = true;
  policy.settings = '';
  policy.save();

  return policy;
}
