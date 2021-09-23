import { arrayDiff, arrayUnique } from '@enzymefinance/subgraph-utils';
import { Bytes } from '@graphprotocol/graph-ts';
import { ensureDepositorWhitelistPolicy } from '../../entities/DepositorWhitelistPolicy';
import { AddressesAdded, AddressesRemoved } from '../../generated/contracts/InvestorWhitelist3Events';

export function handleAddressesAdded(event: AddressesAdded): void {
  let policy = ensureDepositorWhitelistPolicy(event.params.comptrollerProxy, event.address, event);
  let bytes = event.params.items.map<Bytes>((item) => item as Bytes);
  policy.depositors = arrayUnique<Bytes>(policy.depositors.concat(bytes));
  policy.updatedAt = event.block.timestamp.toI32();
  policy.save();
}

export function handleAddressesRemoved(event: AddressesRemoved): void {
  let policy = ensureDepositorWhitelistPolicy(event.params.comptrollerProxy, event.address, event);
  let bytes = event.params.items.map<Bytes>((item) => item as Bytes);
  policy.depositors = arrayDiff<Bytes>(policy.depositors, bytes);
  policy.updatedAt = event.block.timestamp.toI32();
  policy.save();
}
