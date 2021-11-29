import { Address, ethereum } from '@graphprotocol/graph-ts';
import { OnlyRemoveDustExternalPositionPolicy } from '../generated/schema';
import { policyId } from './Policy';

export function ensureOnlyRemoveDustExternalPositionPolicy(
  comptrollerAddress: Address,
  policyAddress: Address,
  event: ethereum.Event,
): OnlyRemoveDustExternalPositionPolicy {
  let id = policyId(comptrollerAddress, policyAddress);
  let policy = OnlyRemoveDustExternalPositionPolicy.load(id);

  if (policy) {
    return policy;
  }

  policy = new OnlyRemoveDustExternalPositionPolicy(id);
  policy.policy = policyAddress;
  policy.policyType = 'OnlyRemoveDustExternalPosition';
  policy.comptroller = comptrollerAddress.toHex();
  policy.createdAt = event.block.timestamp.toI32();
  policy.enabled = true;
  policy.settings = '';
  policy.save();

  return policy;
}
