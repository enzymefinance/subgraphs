import { arrayDiff, arrayUnique } from '@enzymefinance/subgraph-utils';
import { ensureAdapterWhitelistPolicy } from '../../entities/AdapterWhitelistPolicy';
import { AddressesAdded, AddressesRemoved } from '../../generated/AdapterWhitelist2Contract';

export function handleAddressesAdded(event: AddressesAdded): void {
  let items = event.params.items.map<string>((item) => item.toHex());

  let policy = ensureAdapterWhitelistPolicy(event.params.comptrollerProxy, event.address, event);
  policy.adapters = arrayUnique<string>(policy.adapters.concat(items));
  policy.save();
}

export function handleAddressesRemoved(event: AddressesRemoved): void {
  let items = event.params.items.map<string>((item) => item.toHex());

  let policy = ensureAdapterWhitelistPolicy(event.params.comptrollerProxy, event.address, event);
  policy.adapters = arrayDiff<string>(policy.adapters, items);
  policy.save();
}
