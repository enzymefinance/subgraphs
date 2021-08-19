import { Address, ethereum } from '@graphprotocol/graph-ts';
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
  policy.policy = policyAddress.toHex();
  policy.comptroller = comptrollerAddress.toHex();
  policy.adapters = new Array<string>();
  policy.createdAt = event.block.timestamp;
  policy.enabled = true;
  policy.settings = '';
  policy.save();

  return policy;
}
