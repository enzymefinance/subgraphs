import { Address, ethereum } from '@graphprotocol/graph-ts';
import { NoDepegOnRedeemSharesForSpecificAssetsPolicy } from '../generated/schema';
import { policyId } from './Policy';

export function ensureNoDepegOnRedeemSharesForSpecificAssetsPolicy(
  comptrollerAddress: Address,
  policyAddress: Address,
  event: ethereum.Event,
): NoDepegOnRedeemSharesForSpecificAssetsPolicy {
  let id = policyId(comptrollerAddress, policyAddress);
  let policy = NoDepegOnRedeemSharesForSpecificAssetsPolicy.load(id);

  if (policy) {
    return policy;
  }

  policy = new NoDepegOnRedeemSharesForSpecificAssetsPolicy(id);
  policy.policy = policyAddress;
  policy.policyType = 'NoDepegOnRedeemSharesForSpecificAssets';
  policy.comptroller = comptrollerAddress.toHex();
  policy.assetConfigs = new Array<string>();
  policy.createdAt = event.block.timestamp.toI32();
  policy.updatedAt = 0;
  policy.enabled = true;
  policy.settings = '';
  policy.save();

  return policy;
}
