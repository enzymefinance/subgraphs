import { Address, Bytes, ethereum } from '@graphprotocol/graph-ts';
import { AdapterBlacklistPolicy } from '../generated/schema';
import { policyId } from './Policy';

export function ensureAdapterBlacklistPolicy(
  comptrollerAddress: Address,
  policyAddress: Address,
  event: ethereum.Event,
): AdapterBlacklistPolicy {
  let id = policyId(comptrollerAddress, policyAddress);
  let policy = AdapterBlacklistPolicy.load(id) as AdapterBlacklistPolicy;

  if (policy) {
    return policy;
  }

  policy = new AdapterBlacklistPolicy(id);
  policy.policy = policyAddress;
  policy.type = 'AdapterBlacklist';
  policy.comptroller = comptrollerAddress.toHex();
  policy.adapters = new Array<Bytes>();
  policy.createdAt = event.block.timestamp.toI32();
  policy.enabled = true;
  policy.settings = '';
  policy.save();

  return policy;
}
