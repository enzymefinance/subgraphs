import { arrayDiff, arrayUnique } from '@enzymefinance/subgraph-utils';
import { Bytes } from '@graphprotocol/graph-ts';
import { ensureAdapterBlacklistPolicy } from '../../entities/AdapterBlacklistPolicy';
import { AddressesAdded, AddressesRemoved } from '../../generated/AdapterBlacklist2Contract';

export function handleAddressesAdded(event: AddressesAdded): void {
  let policy = ensureAdapterBlacklistPolicy(event.params.comptrollerProxy, event.address, event);
  policy.adapters = arrayUnique<Bytes>(policy.adapters.concat(event.params.items as Bytes[]));
  policy.save();
}

export function handleAddressesRemoved(event: AddressesRemoved): void {
  let policy = ensureAdapterBlacklistPolicy(event.params.comptrollerProxy, event.address, event);
  policy.adapters = arrayDiff<Bytes>(policy.adapters, event.params.items as Bytes[]);
  policy.save();
}
