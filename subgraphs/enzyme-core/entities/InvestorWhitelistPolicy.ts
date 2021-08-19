import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts';
import { InvestorWhitelistPolicy } from '../generated/schema';
import { policyId } from './Policy';

export function ensureInvestorWhitelistPolicy(
  comptrollerAddress: Address,
  policyAddress: Address,
  event: ethereum.Event,
): InvestorWhitelistPolicy {
  let id = policyId(comptrollerAddress, policyAddress);
  let policy = InvestorWhitelistPolicy.load(id) as InvestorWhitelistPolicy;

  if (policy) {
    return policy;
  }

  policy = new InvestorWhitelistPolicy(id);
  policy.policy = policyAddress.toHex();
  policy.comptroller = comptrollerAddress.toHex();
  policy.investors = new Array<string>();
  policy.createdAt = event.block.timestamp;
  policy.updatedAt = BigInt.fromI32(0);
  policy.enabled = true;
  policy.settings = '';
  policy.save();

  return policy;
}
