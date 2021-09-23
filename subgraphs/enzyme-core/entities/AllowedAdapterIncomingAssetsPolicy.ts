import { Address, ethereum } from '@graphprotocol/graph-ts';
import { AllowedAdapterIncomingAssetsPolicy } from '../generated/schema';
import { policyId } from './Policy';

export function ensureAllowedAdapterIncomingAssetsPolicy(
  comptrollerAddress: Address,
  policyAddress: Address,
  event: ethereum.Event,
): AllowedAdapterIncomingAssetsPolicy {
  let id = policyId(comptrollerAddress, policyAddress);
  let policy = AllowedAdapterIncomingAssetsPolicy.load(id);

  if (policy) {
    return policy;
  }

  policy = new AllowedAdapterIncomingAssetsPolicy(id);
  policy.policy = policyAddress;
  policy.type = 'AllowedAdapterIncomingAssets';
  policy.comptroller = comptrollerAddress.toHex();
  policy.addressLists = new Array<string>();
  policy.createdAt = event.block.timestamp.toI32();
  policy.enabled = true;
  policy.settings = '';
  policy.save();

  return policy;
}
