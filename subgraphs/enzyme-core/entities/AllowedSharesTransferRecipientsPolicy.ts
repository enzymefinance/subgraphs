import { Address, ethereum } from '@graphprotocol/graph-ts';
import { AllowedSharesTransferRecipientsPolicy } from '../generated/schema';
import { policyId } from './Policy';

export function ensureAllowedSharesTransferRecipientsPolicy(
  comptrollerAddress: Address,
  policyAddress: Address,
  event: ethereum.Event,
): AllowedSharesTransferRecipientsPolicy {
  let id = policyId(comptrollerAddress, policyAddress);
  let policy = AllowedSharesTransferRecipientsPolicy.load(id);

  if (policy) {
    return policy;
  }

  policy = new AllowedSharesTransferRecipientsPolicy(id);
  policy.policy = policyAddress;
  policy.policyType = 'AllowedSharesTransferRecipients';
  policy.comptroller = comptrollerAddress.toHex();
  policy.addressLists = new Array<string>();
  policy.createdAt = event.block.timestamp.toI32();
  policy.enabled = true;
  policy.settings = '';
  policy.save();

  return policy;
}
