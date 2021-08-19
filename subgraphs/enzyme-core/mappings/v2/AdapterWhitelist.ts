import { arrayDiff, arrayUnique } from '@enzymefinance/subgraph-utils';
import { Bytes } from '@graphprotocol/graph-ts';
import { ensureAdapterWhitelistPolicy } from '../../entities/AdapterWhitelistPolicy';
import { AddressesAdded, AddressesRemoved } from '../../generated/AdapterWhitelist2Contract';

export function handleAddressesAdded(event: AddressesAdded): void {
  let policy = ensureAdapterWhitelistPolicy(event.params.comptrollerProxy, event.address, event);
  policy.adapters = arrayUnique<Bytes>(policy.adapters.concat(event.params.items as Bytes[]));
  policy.save();
}

export function handleAddressesRemoved(event: AddressesRemoved): void {
  let policy = ensureAdapterWhitelistPolicy(event.params.comptrollerProxy, event.address, event);
  policy.adapters = arrayDiff<Bytes>(policy.adapters, event.params.items as Bytes[]);
  policy.save();
}
