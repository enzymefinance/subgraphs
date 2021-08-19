import { arrayDiff, arrayUnique } from '@enzymefinance/subgraph-utils';
import { Bytes } from '@graphprotocol/graph-ts';
import { ensureBuySharesCallerWhitelistPolicy } from '../../entities/BuySharesCallerWhitelistPolicy';
import { AddressesAdded, AddressesRemoved } from '../../generated/BuySharesCallerWhitelist2Contract';

export function handleAddressesAdded(event: AddressesAdded): void {
  let policy = ensureBuySharesCallerWhitelistPolicy(event.params.comptrollerProxy, event.address, event);
  policy.callers = arrayUnique<Bytes>(policy.callers.concat(event.params.items as Bytes[]));
  policy.save();
}

export function handleAddressesRemoved(event: AddressesRemoved): void {
  let policy = ensureBuySharesCallerWhitelistPolicy(event.params.comptrollerProxy, event.address, event);
  policy.callers = arrayDiff<Bytes>(policy.callers, event.params.items as Bytes[]);
}
