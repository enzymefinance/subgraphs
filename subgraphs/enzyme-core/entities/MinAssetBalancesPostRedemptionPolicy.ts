import { Address, ethereum } from '@graphprotocol/graph-ts';
import { MinAssetBalancesPostRedemptionPolicy } from '../generated/schema';
import { policyId } from './Policy';

export function ensureMinAssetBalancesPostRedemptionPolicy(
  comptrollerAddress: Address,
  policyAddress: Address,
  event: ethereum.Event,
): MinAssetBalancesPostRedemptionPolicy {
  let id = policyId(comptrollerAddress, policyAddress);
  let policy = MinAssetBalancesPostRedemptionPolicy.load(id);

  if (policy) {
    return policy;
  }

  policy = new MinAssetBalancesPostRedemptionPolicy(id);
  policy.policy = policyAddress;
  policy.policyType = 'MinAssetBalancesPostRedemption';
  policy.comptroller = comptrollerAddress.toHex();
  policy.assetBalances = new Array<string>();
  policy.createdAt = event.block.timestamp.toI32();
  policy.updatedAt = 0;
  policy.enabled = true;
  policy.settings = '';
  policy.save();

  return policy;
}
