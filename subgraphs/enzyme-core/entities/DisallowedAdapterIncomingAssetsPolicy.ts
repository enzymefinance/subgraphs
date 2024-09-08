import { Address, ethereum } from '@graphprotocol/graph-ts';
import { DisallowedAdapterIncomingAssetsPolicy } from '../generated/schema';
import { policyId } from './Policy';

export function ensureDisallowedAdapterIncomingAssetsPolicy(
  comptrollerAddress: Address,
  policyAddress: Address,
  event: ethereum.Event,
): DisallowedAdapterIncomingAssetsPolicy {
  let id = policyId(comptrollerAddress, policyAddress);
  let policy = DisallowedAdapterIncomingAssetsPolicy.load(id);

  if (policy) {
    return policy;
  }

  policy = new DisallowedAdapterIncomingAssetsPolicy(id);
  policy.policy = policyAddress;
  policy.policyType = 'DisallowedAdapterIncomingAssets';
  policy.comptroller = comptrollerAddress.toHex();
  policy.addressLists = new Array<string>();
  policy.createdAt = event.block.timestamp.toI32();
  policy.enabled = true;
  policy.settings = '';
  policy.save();

  return policy;
}
