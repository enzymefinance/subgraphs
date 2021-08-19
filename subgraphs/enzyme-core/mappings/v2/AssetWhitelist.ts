import { arrayDiff, arrayUnique } from '@enzymefinance/subgraph-utils';
import { ensureAssetWhitelistPolicy } from '../../entities/AssetWhitelistPolicy';
import { AddressesAdded, AddressesRemoved } from '../../generated/AssetWhitelist2Contract';

export function handleAddressesAdded(event: AddressesAdded): void {
  let items = event.params.items.map<string>((item) => item.toHex());

  let policy = ensureAssetWhitelistPolicy(event.params.comptrollerProxy, event.address, event);
  policy.assets = arrayUnique<string>(policy.assets.concat(items));
  policy.save();
}

export function handleAddressesRemoved(event: AddressesRemoved): void {
  let items = event.params.items.map<string>((item) => item.toHex());

  let policy = ensureAssetWhitelistPolicy(event.params.comptrollerProxy, event.address, event);
  policy.assets = arrayDiff<string>(policy.assets, items);
  policy.save();
}
