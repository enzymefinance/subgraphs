import { Address, ethereum } from '@graphprotocol/graph-ts';
import { AllowedAdaptersPerManagerPolicy } from '../generated/schema';
import { policyId } from './Policy';

export function ensureAllowedAdaptersPerManagerPolicy(
  comptrollerAddress: Address,
  policyAddress: Address,
  event: ethereum.Event,
): AllowedAdaptersPerManagerPolicy {
  let id = policyId(comptrollerAddress, policyAddress);
  let policy = AllowedAdaptersPerManagerPolicy.load(id);

  if (policy) {
    return policy;
  }

  policy = new AllowedAdaptersPerManagerPolicy(id);
  policy.policy = policyAddress;
  policy.policyType = 'AllowedAdaptersPerManager';
  policy.comptroller = comptrollerAddress.toHex();
  policy.userAddressLists = new Array<string>();
  policy.createdAt = event.block.timestamp.toI32();
  policy.enabled = true;
  policy.settings = '';
  policy.save();

  return policy;
}
