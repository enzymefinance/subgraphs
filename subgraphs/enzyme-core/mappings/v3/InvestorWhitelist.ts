import { arrayDiff, arrayUnique } from '@enzymefinance/subgraph-utils';
import { Bytes } from '@graphprotocol/graph-ts';
import { ensureDepositorWhitelistPolicy } from '../../entities/DepositorWhitelistPolicy';
import { AddressesAdded, AddressesRemoved } from '../../generated/InvestorWhitelist3Contract';

export function handleAddressesAdded(event: AddressesAdded): void {
  let policy = ensureDepositorWhitelistPolicy(event.params.comptrollerProxy, event.address, event);
  policy.depositors = arrayUnique<Bytes>(policy.depositors.concat(event.params.items as Bytes[]));
  policy.updatedAt = event.block.timestamp.toI32();
  policy.save();
}

export function handleAddressesRemoved(event: AddressesRemoved): void {
  let policy = ensureDepositorWhitelistPolicy(event.params.comptrollerProxy, event.address, event);
  policy.depositors = arrayDiff<Bytes>(policy.depositors, event.params.items as Bytes[]);
  policy.updatedAt = event.block.timestamp.toI32();
  policy.save();
}
