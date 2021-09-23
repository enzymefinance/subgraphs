import { arrayDiff, arrayUnique } from '@enzymefinance/subgraph-utils';
import { Bytes } from '@graphprotocol/graph-ts';
import { ensureAssetWhitelistPolicy } from '../../entities/AssetWhitelistPolicy';
import { AddressesAdded, AddressesRemoved } from '../../generated/contracts/AssetWhitelist2Events';

export function handleAddressesAdded(event: AddressesAdded): void {
  let policy = ensureAssetWhitelistPolicy(event.params.comptrollerProxy, event.address, event);
  let bytes = event.params.items.map<Bytes>((item) => item as Bytes);
  policy.assets = arrayUnique<Bytes>(policy.assets.concat(bytes));
  policy.save();
}

export function handleAddressesRemoved(event: AddressesRemoved): void {
  let policy = ensureAssetWhitelistPolicy(event.params.comptrollerProxy, event.address, event);
  let bytes = event.params.items.map<Bytes>((item) => item as Bytes);
  policy.assets = arrayDiff<Bytes>(policy.assets, bytes);
  policy.save();
}
