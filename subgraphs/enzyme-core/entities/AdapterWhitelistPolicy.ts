import { Address, ethereum } from '@graphprotocol/graph-ts';
import { AdapterWhitelistPolicy } from '../generated/schema';
import { policyId } from './Policy';

export function ensureAdapterWhitelistPolicy(
  comptrollerAddress: Address,
  policyAddress: Address,
  event: ethereum.Event,
): AdapterWhitelistPolicy {
  let id = policyId(comptrollerAddress, policyAddress);
  let policy = AdapterWhitelistPolicy.load(id) as AdapterWhitelistPolicy;

  if (policy) {
    return policy;
  }

  policy = new AdapterWhitelistPolicy(id);
  policy.policy = policyAddress.toHex();
  policy.comptroller = comptrollerAddress.toHex();
  policy.adapters = new Array<string>();
  policy.createdAt = event.block.timestamp;
  policy.enabled = true;
  policy.settings = '';
  policy.save();

  return policy;
}
