import { arrayDiff, arrayUnique } from '@enzymefinance/subgraph-utils';
import { ensureAdapterBlacklistPolicy } from '../../entities/AdapterBlacklistPolicy';
import { AddressesAdded, AddressesRemoved } from '../../generated/AdapterBlacklist3Contract';

export function handleAddressesAdded(event: AddressesAdded): void {
  let items = event.params.items.map<string>((item) => item.toHex());

  let policy = ensureAdapterBlacklistPolicy(event.params.comptrollerProxy, event.address, event);
  policy.adapters = arrayUnique<string>(policy.adapters.concat(items));
  policy.save();
}

export function handleAddressesRemoved(event: AddressesRemoved): void {
  let items = event.params.items.map<string>((item) => item.toHex());

  let policy = ensureAdapterBlacklistPolicy(event.params.comptrollerProxy, event.address, event);
  policy.adapters = arrayDiff<string>(policy.adapters, items);
  policy.save();
}
