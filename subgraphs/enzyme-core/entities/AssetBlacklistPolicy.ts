import { Address, Bytes, ethereum } from '@graphprotocol/graph-ts';
import { AssetBlacklistPolicy } from '../generated/schema';
import { policyId } from './Policy';

export function ensureAssetBlacklistPolicy(
  comptrollerAddress: Address,
  policyAddress: Address,
  event: ethereum.Event,
): AssetBlacklistPolicy {
  let id = policyId(comptrollerAddress, policyAddress);
  let policy = AssetBlacklistPolicy.load(id);

  if (policy) {
    return policy;
  }

  policy = new AssetBlacklistPolicy(id);
  policy.policy = policyAddress;
  policy.type = 'AssetBlacklist';
  policy.comptroller = comptrollerAddress.toHex();
  policy.assets = new Array<Bytes>();
  policy.createdAt = event.block.timestamp.toI32();
  policy.enabled = true;
  policy.settings = '';
  policy.save();

  return policy;
}
