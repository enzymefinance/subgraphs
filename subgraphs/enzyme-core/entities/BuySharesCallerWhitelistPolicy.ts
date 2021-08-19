import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts';
import { BuySharesCallerWhitelistPolicy } from '../generated/schema';
import { policyId } from './Policy';

export function ensureBuySharesCallerWhitelistPolicy(
  comptrollerAddress: Address,
  policyAddress: Address,
  event: ethereum.Event,
): BuySharesCallerWhitelistPolicy {
  let id = policyId(comptrollerAddress, policyAddress);
  let policy = BuySharesCallerWhitelistPolicy.load(id) as BuySharesCallerWhitelistPolicy;

  if (policy) {
    return policy;
  }

  policy = new BuySharesCallerWhitelistPolicy(id);
  policy.policy = policyAddress.toHex();
  policy.comptroller = comptrollerAddress.toHex();
  policy.callers = new Array<string>();
  policy.createdAt = event.block.timestamp;
  policy.enabled = true;
  policy.settings = '';
  policy.updatedAt = BigInt.fromI32(0);
  policy.save();

  return policy;
}
