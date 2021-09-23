import { Address, ethereum } from '@graphprotocol/graph-ts';
import { AllowedAdaptersPolicy } from '../generated/schema';
import { policyId } from './Policy';

export function ensureAllowedAdaptersPolicy(
  comptrollerAddress: Address,
  policyAddress: Address,
  event: ethereum.Event,
): AllowedAdaptersPolicy {
  let id = policyId(comptrollerAddress, policyAddress);
  let policy = AllowedAdaptersPolicy.load(id);

  if (policy) {
    return policy;
  }

  policy = new AllowedAdaptersPolicy(id);
  policy.policy = policyAddress;
  policy.type = 'AllowedAdapters';
  policy.comptroller = comptrollerAddress.toHex();
  policy.addressLists = new Array<string>();
  policy.createdAt = event.block.timestamp.toI32();
  policy.enabled = true;
  policy.settings = '';
  policy.save();

  return policy;
}
