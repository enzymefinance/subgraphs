import { Address, ethereum } from '@graphprotocol/graph-ts';
import { AllowedExternalPositionTypesPerManagerPolicy } from '../generated/schema';
import { policyId } from './Policy';

export function ensureAllowedExternalPositionTypesPerManagerPolicy(
  comptrollerAddress: Address,
  policyAddress: Address,
  event: ethereum.Event,
): AllowedExternalPositionTypesPerManagerPolicy {
  let id = policyId(comptrollerAddress, policyAddress);
  let policy = AllowedExternalPositionTypesPerManagerPolicy.load(id);

  if (policy) {
    return policy;
  }

  policy = new AllowedExternalPositionTypesPerManagerPolicy(id);
  policy.policy = policyAddress;
  policy.policyType = 'AllowedExternalPositionTypesPerManager';
  policy.comptroller = comptrollerAddress.toHex();
  policy.userUintLists = new Array<string>();
  policy.createdAt = event.block.timestamp.toI32();
  policy.enabled = true;
  policy.settings = '';
  policy.save();

  return policy;
}
