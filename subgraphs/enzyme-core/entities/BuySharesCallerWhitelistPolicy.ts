import { Address, Bytes, ethereum } from '@graphprotocol/graph-ts';
import { BuySharesCallerWhitelistPolicy } from '../generated/schema';
import { policyId } from './Policy';

export function ensureBuySharesCallerWhitelistPolicy(
  comptrollerAddress: Address,
  policyAddress: Address,
  event: ethereum.Event,
): BuySharesCallerWhitelistPolicy {
  let id = policyId(comptrollerAddress, policyAddress);
  let policy = BuySharesCallerWhitelistPolicy.load(id);

  if (policy) {
    return policy;
  }

  policy = new BuySharesCallerWhitelistPolicy(id);
  policy.policy = policyAddress;
  policy.policyType = 'BuySharesCallerWhitelist';
  policy.comptroller = comptrollerAddress.toHex();
  policy.callers = new Array<Bytes>();
  policy.createdAt = event.block.timestamp.toI32();
  policy.enabled = true;
  policy.settings = '';
  policy.updatedAt = 0;
  policy.save();

  return policy;
}
