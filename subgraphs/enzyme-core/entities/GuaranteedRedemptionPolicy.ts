import { Address, ethereum } from '@graphprotocol/graph-ts';
import { GuaranteedRedemptionPolicy } from '../generated/schema';
import { policyId } from './Policy';

export function ensureGuaranteedRedemptionPolicy(
  comptrollerAddress: Address,
  policyAddress: Address,
  event: ethereum.Event,
): GuaranteedRedemptionPolicy {
  let id = policyId(comptrollerAddress, policyAddress);
  let policy = GuaranteedRedemptionPolicy.load(id);

  if (policy) {
    return policy;
  }

  policy = new GuaranteedRedemptionPolicy(id);
  policy.policy = policyAddress;
  policy.policyType = 'GuaranteedRedemption';
  policy.comptroller = comptrollerAddress.toHex();
  policy.startTimestamp = 0;
  policy.duration = 0;
  policy.createdAt = event.block.timestamp.toI32();
  policy.enabled = true;
  policy.settings = '';
  policy.save();

  return policy;
}
