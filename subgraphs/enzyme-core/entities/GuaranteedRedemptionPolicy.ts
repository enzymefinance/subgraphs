import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts';
import { GuaranteedRedemptionPolicy } from '../generated/schema';
import { policyId } from './Policy';

export function ensureGuaranteedRedemptionPolicy(
  comptrollerAddress: Address,
  policyAddress: Address,
  event: ethereum.Event,
): GuaranteedRedemptionPolicy {
  let id = policyId(comptrollerAddress, policyAddress);
  let policy = GuaranteedRedemptionPolicy.load(id) as GuaranteedRedemptionPolicy;

  if (policy) {
    return policy;
  }

  policy = new GuaranteedRedemptionPolicy(id);
  policy.policy = policyAddress.toHex();
  policy.comptroller = comptrollerAddress.toHex();
  policy.startTimestamp = BigInt.fromI32(0);
  policy.duration = BigInt.fromI32(0);
  policy.createdAt = event.block.timestamp;
  policy.enabled = true;
  policy.settings = '';
  policy.save();

  return policy;
}
