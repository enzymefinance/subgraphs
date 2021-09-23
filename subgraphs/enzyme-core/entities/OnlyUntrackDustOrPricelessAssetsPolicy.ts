import { Address, ethereum } from '@graphprotocol/graph-ts';
import { OnlyUntrackDustOrPricelessAssetsPolicy } from '../generated/schema';
import { policyId } from './Policy';

export function ensureOnlyUntrackDustOrPricelessAssetsPolicy(
  comptrollerAddress: Address,
  policyAddress: Address,
  event: ethereum.Event,
): OnlyUntrackDustOrPricelessAssetsPolicy {
  let id = policyId(comptrollerAddress, policyAddress);
  let policy = OnlyUntrackDustOrPricelessAssetsPolicy.load(id);

  if (policy) {
    return policy;
  }

  policy = new OnlyUntrackDustOrPricelessAssetsPolicy(id);
  policy.policy = policyAddress;
  policy.type = 'OnlyUntrackDustOrPricelessAssets';
  policy.comptroller = comptrollerAddress.toHex();
  policy.createdAt = event.block.timestamp.toI32();
  policy.enabled = true;
  policy.settings = '';
  policy.save();

  return policy;
}
