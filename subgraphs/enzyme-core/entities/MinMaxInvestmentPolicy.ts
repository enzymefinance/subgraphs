import { Address, BigDecimal, ethereum } from '@graphprotocol/graph-ts';
import { MinMaxInvestmentPolicy } from '../generated/schema';
import { policyId } from './Policy';

export function ensureMinMaxInvestmentPolicy(
  comptrollerAddress: Address,
  policyAddress: Address,
  event: ethereum.Event,
): MinMaxInvestmentPolicy {
  let id = policyId(comptrollerAddress, policyAddress);
  let policy = MinMaxInvestmentPolicy.load(id) as MinMaxInvestmentPolicy;

  if (policy) {
    return policy;
  }

  policy = new MinMaxInvestmentPolicy(id);
  policy.policy = policyAddress;
  policy.comptroller = comptrollerAddress.toHex();
  policy.minInvestmentAmount = BigDecimal.fromString('0');
  policy.maxInvestmentAmount = BigDecimal.fromString('0');
  policy.createdAt = event.block.timestamp.toI32();
  policy.updatedAt = 0;
  policy.enabled = true;
  policy.settings = '';
  policy.save();

  return policy;
}
