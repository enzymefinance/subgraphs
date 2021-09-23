import { Address, BigDecimal, ethereum } from '@graphprotocol/graph-ts';
import { MaxConcentrationPolicy } from '../generated/schema';
import { policyId } from './Policy';

export function ensureMaxConcentrationPolicy(
  comptrollerAddress: Address,
  policyAddress: Address,
  event: ethereum.Event,
): MaxConcentrationPolicy {
  let id = policyId(comptrollerAddress, policyAddress);
  let policy = MaxConcentrationPolicy.load(id);

  if (policy) {
    return policy;
  }

  policy = new MaxConcentrationPolicy(id);
  policy.policy = policyAddress;
  policy.type = 'MaxConcentration';
  policy.comptroller = comptrollerAddress.toHex();
  policy.maxConcentration = BigDecimal.fromString('0');
  policy.createdAt = event.block.timestamp.toI32();
  policy.enabled = true;
  policy.settings = '';
  policy.save();

  return policy;
}
