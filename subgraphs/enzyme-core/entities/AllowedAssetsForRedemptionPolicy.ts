import { Address, ethereum } from '@graphprotocol/graph-ts';
import { AllowedAssetsForRedemptionPolicy } from '../generated/schema';
import { policyId } from './Policy';

export function ensureAllowedAssetsForRedemptionPolicy(
  comptrollerAddress: Address,
  policyAddress: Address,
  event: ethereum.Event,
): AllowedAssetsForRedemptionPolicy {
  let id = policyId(comptrollerAddress, policyAddress);
  let policy = AllowedAssetsForRedemptionPolicy.load(id);

  if (policy) {
    return policy;
  }

  policy = new AllowedAssetsForRedemptionPolicy(id);
  policy.policy = policyAddress;
  policy.type = 'AllowedAssetsForRedemption';
  policy.comptroller = comptrollerAddress.toHex();
  policy.addressLists = new Array<string>();
  policy.createdAt = event.block.timestamp.toI32();
  policy.enabled = true;
  policy.settings = '';
  policy.save();

  return policy;
}
