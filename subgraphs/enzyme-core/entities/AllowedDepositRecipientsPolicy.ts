import { Address, ethereum } from '@graphprotocol/graph-ts';
import { AllowedDepositRecipientsPolicy } from '../generated/schema';
import { policyId } from './Policy';

export function ensureAllowedDepositRecipientsPolicy(
  comptrollerAddress: Address,
  policyAddress: Address,
  event: ethereum.Event,
): AllowedDepositRecipientsPolicy {
  let id = policyId(comptrollerAddress, policyAddress);
  let policy = AllowedDepositRecipientsPolicy.load(id);

  if (policy) {
    return policy;
  }

  policy = new AllowedDepositRecipientsPolicy(id);
  policy.policy = policyAddress;
  policy.type = 'AllowedDepositRecipients';
  policy.comptroller = comptrollerAddress.toHex();
  policy.addressLists = new Array<string>();
  policy.createdAt = event.block.timestamp.toI32();
  policy.enabled = true;
  policy.settings = '';
  policy.save();

  return policy;
}
