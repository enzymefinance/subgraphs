import { arrayDiff, arrayUnique } from '@enzymefinance/subgraph-utils';
import { ensureBuySharesCallerWhitelistPolicy } from '../../entities/BuySharesCallerWhitelistPolicy';
import { AddressesAdded, AddressesRemoved } from '../../generated/BuySharesCallerWhitelist2Contract';

export function handleAddressesAdded(event: AddressesAdded): void {
  let items = event.params.items.map<string>((item) => item.toHex());

  let policy = ensureBuySharesCallerWhitelistPolicy(event.params.comptrollerProxy, event.address, event);
  policy.callers = arrayUnique<string>(policy.callers.concat(items));
  policy.save();
}

export function handleAddressesRemoved(event: AddressesRemoved): void {
  let items = event.params.items.map<string>((item) => item.toHex());

  let policy = ensureBuySharesCallerWhitelistPolicy(event.params.comptrollerProxy, event.address, event);
  policy.callers = arrayDiff<string>(policy.callers, items);
  policy.save();
}
