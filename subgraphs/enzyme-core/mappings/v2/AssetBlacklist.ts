import { arrayDiff, arrayUnique } from '@enzymefinance/subgraph-utils';
import { Bytes } from '@graphprotocol/graph-ts';
import { ensureAssetBlacklistPolicy } from '../../entities/AssetBlacklistPolicy';
import { AddressesAdded, AddressesRemoved } from '../../generated/contracts/AssetBlacklist2Events';

export function handleAddressesAdded(event: AddressesAdded): void {
  let policy = ensureAssetBlacklistPolicy(event.params.comptrollerProxy, event.address, event);
  let bytes = event.params.items.map<Bytes>((item) => item as Bytes);
  policy.assets = arrayUnique<Bytes>(policy.assets.concat(bytes));
  policy.save();
}

export function handleAddressesRemoved(event: AddressesRemoved): void {
  let policy = ensureAssetBlacklistPolicy(event.params.comptrollerProxy, event.address, event);
  let bytes = event.params.items.map<Bytes>((item) => item as Bytes);
  policy.assets = arrayDiff<Bytes>(policy.assets, bytes);
  policy.save();
}
