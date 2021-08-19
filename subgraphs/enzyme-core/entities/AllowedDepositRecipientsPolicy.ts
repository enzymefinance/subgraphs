import { Address, ethereum } from '@graphprotocol/graph-ts';
import { AllowedDepositRecipientsPolicy } from '../generated/schema';
import { policyId } from './Policy';

export function ensureAllowedDepositRecipientsPolicy(
  comptrollerAddress: Address,
  policyAddress: Address,
  event: ethereum.Event,
): AllowedDepositRecipientsPolicy {
  let id = policyId(comptrollerAddress, policyAddress);
  let policy = AllowedDepositRecipientsPolicy.load(id) as AllowedDepositRecipientsPolicy;

  if (policy) {
    return policy;
  }

  policy = new AllowedDepositRecipientsPolicy(id);
  policy.policy = policyAddress.toHex();
  policy.comptroller = comptrollerAddress.toHex();
  policy.accounts = new Array<string>();
  policy.createdAt = event.block.timestamp;
  policy.enabled = true;
  policy.settings = '';
  policy.save();

  return policy;
}
