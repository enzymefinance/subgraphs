import { Address, ethereum } from '@graphprotocol/graph-ts';
import { AllowedRedeemersForSpecificAssetsPolicy } from '../generated/schema';
import { policyId } from './Policy';

export function ensureAllowedRedeemersForSpecificAssetsPolicy(
  comptrollerAddress: Address,
  policyAddress: Address,
  event: ethereum.Event,
): AllowedRedeemersForSpecificAssetsPolicy {
  let id = policyId(comptrollerAddress, policyAddress);
  let policy = AllowedRedeemersForSpecificAssetsPolicy.load(id);

  if (policy) {
    return policy;
  }

  policy = new AllowedRedeemersForSpecificAssetsPolicy(id);
  policy.policy = policyAddress;
  policy.policyType = 'AllowedRedeemersForSpecificAssets';
  policy.comptroller = comptrollerAddress.toHex();
  policy.addressLists = new Array<string>();
  policy.createdAt = event.block.timestamp.toI32();
  policy.enabled = true;
  policy.settings = '';
  policy.save();

  return policy;
}
