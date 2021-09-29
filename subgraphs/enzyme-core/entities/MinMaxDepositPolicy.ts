import { Address, BigDecimal, ethereum } from '@graphprotocol/graph-ts';
import { MinMaxDepositPolicy } from '../generated/schema';
import { policyId } from './Policy';

export function ensureMinMaxDepositPolicy(
  comptrollerAddress: Address,
  policyAddress: Address,
  event: ethereum.Event,
): MinMaxDepositPolicy {
  let id = policyId(comptrollerAddress, policyAddress);
  let policy = MinMaxDepositPolicy.load(id);

  if (policy) {
    return policy;
  }

  policy = new MinMaxDepositPolicy(id);
  policy.policy = policyAddress;
  policy.policyType = 'MinMaxDeposit';
  policy.comptroller = comptrollerAddress.toHex();
  policy.minDepositAmount = BigDecimal.fromString('0');
  policy.maxDepositAmount = BigDecimal.fromString('0');
  policy.createdAt = event.block.timestamp.toI32();
  policy.updatedAt = 0;
  policy.enabled = true;
  policy.settings = '';
  policy.save();

  return policy;
}
