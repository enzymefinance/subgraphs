import { arrayDiff, arrayUnique } from '@enzymefinance/subgraph-utils';
import { Bytes } from '@graphprotocol/graph-ts';
import { ensureAllowedAdapterIncomingAssetsPolicy } from '../../entities/AllowedAdapterIncomingAssetsPolicy';
import { AddressesAdded, AddressesRemoved } from '../../generated/AllowedAdapterIncomingAssets4Contract';

export function handleAddressesAdded(event: AddressesAdded): void {
  let policy = ensureAllowedAdapterIncomingAssetsPolicy(event.params.comptrollerProxy, event.address, event);
  policy.assets = arrayUnique<Bytes>(policy.assets.concat(event.params.items as Bytes[]));
  policy.save();
}

export function handleAddressesRemoved(event: AddressesRemoved): void {
  let policy = ensureAllowedAdapterIncomingAssetsPolicy(event.params.comptrollerProxy, event.address, event);
  policy.assets = arrayDiff<Bytes>(policy.assets, event.params.items as Bytes[]);
  policy.save();
}
