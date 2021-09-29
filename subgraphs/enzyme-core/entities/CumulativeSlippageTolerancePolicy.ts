import { Address, BigDecimal, ethereum } from '@graphprotocol/graph-ts';
import { CumulativeSlippageTolerancePolicy } from '../generated/schema';
import { policyId } from './Policy';

export function ensureCumulativeSlippageTolerancePolicy(
  comptrollerAddress: Address,
  policyAddress: Address,
  event: ethereum.Event,
): CumulativeSlippageTolerancePolicy {
  let id = policyId(comptrollerAddress, policyAddress);
  let policy = CumulativeSlippageTolerancePolicy.load(id);

  if (policy) {
    return policy;
  }

  policy = new CumulativeSlippageTolerancePolicy(id);
  policy.policy = policyAddress;
  policy.policyType = 'CumulativeSlippageTolerance';
  policy.comptroller = comptrollerAddress.toHex();
  policy.createdAt = event.block.timestamp.toI32();
  policy.enabled = true;
  policy.settings = '';
  policy.tolerance = BigDecimal.fromString('0');
  policy.cumulativeSlippage = BigDecimal.fromString('0');
  policy.lastSlippageTimestamp = 0;
  policy.save();

  return policy;
}
