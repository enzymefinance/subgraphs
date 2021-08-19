import { Address, Bytes, ethereum } from '@graphprotocol/graph-ts';
import { AssetWhitelistPolicy } from '../generated/schema';
import { policyId } from './Policy';

export function ensureAssetWhitelistPolicy(
  comptrollerAddress: Address,
  policyAddress: Address,
  event: ethereum.Event,
): AssetWhitelistPolicy {
  let id = policyId(comptrollerAddress, policyAddress);
  let policy = AssetWhitelistPolicy.load(id) as AssetWhitelistPolicy;

  if (policy) {
    return policy;
  }

  policy = new AssetWhitelistPolicy(id);
  policy.policy = policyAddress;
  policy.comptroller = comptrollerAddress.toHex();
  policy.assets = new Array<Bytes>();
  policy.createdAt = event.block.timestamp.toI32();
  policy.enabled = true;
  policy.settings = '';
  policy.save();

  return policy;
}
