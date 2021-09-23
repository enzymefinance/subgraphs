import { Address, Bytes, ethereum } from '@graphprotocol/graph-ts';
import { DepositorWhitelistPolicy } from '../generated/schema';
import { policyId } from './Policy';

export function ensureDepositorWhitelistPolicy(
  comptrollerAddress: Address,
  policyAddress: Address,
  event: ethereum.Event,
): DepositorWhitelistPolicy {
  let id = policyId(comptrollerAddress, policyAddress);
  let policy = DepositorWhitelistPolicy.load(id);

  if (policy) {
    return policy;
  }

  policy = new DepositorWhitelistPolicy(id);
  policy.policy = policyAddress;
  policy.type = 'DepositorWhitelist';
  policy.comptroller = comptrollerAddress.toHex();
  policy.depositors = new Array<Bytes>();
  policy.createdAt = event.block.timestamp.toI32();
  policy.updatedAt = 0;
  policy.enabled = true;
  policy.settings = '';
  policy.save();

  return policy;
}
