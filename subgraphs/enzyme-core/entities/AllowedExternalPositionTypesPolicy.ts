import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts';
import { AllowedExternalPositionTypesPolicy } from '../generated/schema';
import { policyId } from './Policy';

export function ensureAllowedExternalPositionTypesPolicy(
  comptrollerAddress: Address,
  policyAddress: Address,
  event: ethereum.Event,
): AllowedExternalPositionTypesPolicy {
  let id = policyId(comptrollerAddress, policyAddress);
  let policy = AllowedExternalPositionTypesPolicy.load(id);

  if (policy) {
    return policy;
  }

  policy = new AllowedExternalPositionTypesPolicy(id);
  policy.policy = policyAddress;
  policy.policyType = 'AllowedExternalPositionTypes';
  policy.comptroller = comptrollerAddress.toHex();
  policy.externalPositionTypes = new Array<BigInt>();
  policy.createdAt = event.block.timestamp.toI32();
  policy.enabled = true;
  policy.settings = '';
  policy.save();

  return policy;
}
