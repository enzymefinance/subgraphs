import { arrayDiff, arrayUnique } from '@enzymefinance/subgraph-utils';
import { ensureAssetBlacklistPolicy } from '../../entities/AssetBlacklistPolicy';
import { AddressesAdded, AddressesRemoved } from '../../generated/AssetBlacklist3Contract';

export function handleAddressesAdded(event: AddressesAdded): void {
  let items = event.params.items.map<string>((item) => item.toHex());

  let policy = ensureAssetBlacklistPolicy(event.params.comptrollerProxy, event.address, event);
  policy.assets = arrayUnique<string>(policy.assets.concat(items));
  policy.save();
}

export function handleAddressesRemoved(event: AddressesRemoved): void {
  let items = event.params.items.map<string>((item) => item.toHex());

  let policy = ensureAssetBlacklistPolicy(event.params.comptrollerProxy, event.address, event);
  policy.assets = arrayDiff<string>(policy.assets, items);
  policy.save();
}
