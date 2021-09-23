import { arrayDiff, arrayUnique } from '@enzymefinance/subgraph-utils';
import { Bytes } from '@graphprotocol/graph-ts';
import { ensureAdapterBlacklistPolicy } from '../../entities/AdapterBlacklistPolicy';
import { AddressesAdded, AddressesRemoved } from '../../generated/contracts/AdapterBlacklist2Events';

export function handleAddressesAdded(event: AddressesAdded): void {
  let policy = ensureAdapterBlacklistPolicy(event.params.comptrollerProxy, event.address, event);
  let bytes = event.params.items.map<Bytes>((item) => item as Bytes);
  policy.adapters = arrayUnique<Bytes>(policy.adapters.concat(bytes));
  policy.save();
}

export function handleAddressesRemoved(event: AddressesRemoved): void {
  let policy = ensureAdapterBlacklistPolicy(event.params.comptrollerProxy, event.address, event);
  let bytes = event.params.items.map<Bytes>((item) => item as Bytes);
  policy.adapters = arrayDiff<Bytes>(policy.adapters, bytes);
  policy.save();
}
