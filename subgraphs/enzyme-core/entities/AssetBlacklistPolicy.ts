import { Address, ethereum } from '@graphprotocol/graph-ts';
import { AssetBlacklistPolicy } from '../generated/schema';
import { policyId } from './Policy';

export function ensureAssetBlacklistPolicy(
  comptrollerAddress: Address,
  policyAddress: Address,
  event: ethereum.Event,
): AssetBlacklistPolicy {
  let id = policyId(comptrollerAddress, policyAddress);
  let policy = AssetBlacklistPolicy.load(id) as AssetBlacklistPolicy;

  if (policy) {
    return policy;
  }

  policy = new AssetBlacklistPolicy(id);
  policy.policy = policyAddress.toHex();
  policy.comptroller = comptrollerAddress.toHex();
  policy.assets = new Array<string>();
  policy.createdAt = event.block.timestamp;
  policy.enabled = true;
  policy.settings = '';
  policy.save();

  return policy;
}
