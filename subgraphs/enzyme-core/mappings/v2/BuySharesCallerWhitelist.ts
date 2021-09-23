import { arrayDiff, arrayUnique } from '@enzymefinance/subgraph-utils';
import { Bytes } from '@graphprotocol/graph-ts';
import { ensureBuySharesCallerWhitelistPolicy } from '../../entities/BuySharesCallerWhitelistPolicy';
import { AddressesAdded, AddressesRemoved } from '../../generated/contracts/BuySharesCallerWhitelist2Events';

export function handleAddressesAdded(event: AddressesAdded): void {
  let policy = ensureBuySharesCallerWhitelistPolicy(event.params.comptrollerProxy, event.address, event);
  let bytes = event.params.items.map<Bytes>((item) => item as Bytes);
  policy.callers = arrayUnique<Bytes>(policy.callers.concat(bytes));
  policy.save();
}

export function handleAddressesRemoved(event: AddressesRemoved): void {
  let policy = ensureBuySharesCallerWhitelistPolicy(event.params.comptrollerProxy, event.address, event);
  let bytes = event.params.items.map<Bytes>((item) => item as Bytes);
  policy.callers = arrayDiff<Bytes>(policy.callers, bytes);
}
