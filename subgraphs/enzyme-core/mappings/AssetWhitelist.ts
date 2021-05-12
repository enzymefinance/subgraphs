import { arrayDiff, arrayUnique } from '../../../utils/utils/array';
import { uniqueEventId } from '../../../utils/utils/id';
import { ensureAssetWhitelistSetting } from '../entities/AssetWhitelistSetting';
import { ensurePolicy } from '../entities/Policy';
import { ensureTransaction } from '../entities/Transaction';
import { useVault } from '../entities/Vault';
import { AddressesAdded, AddressesRemoved } from '../generated/AssetWhitelistContract';
import { ComptrollerLibContract } from '../generated/ComptrollerLibContract';
import { AssetWhitelistAddressesAddedEvent, AssetWhitelistAddressesRemovedEvent } from '../generated/schema';

export function handleAddressesAdded(event: AddressesAdded): void {
  let comptroller = ComptrollerLibContract.bind(event.params.comptrollerProxy);
  let vault = comptroller.getVaultProxy();
  let policy = ensurePolicy(event.address);
  let items = event.params.items.map<string>((item) => item.toHex());

  let addressesAdded = new AssetWhitelistAddressesAddedEvent(uniqueEventId(event));
  addressesAdded.vault = vault.toHex(); // fund does not exist yet
  addressesAdded.timestamp = event.block.timestamp;
  addressesAdded.transaction = ensureTransaction(event).id;
  addressesAdded.comptrollerProxy = event.params.comptrollerProxy.toHex();
  addressesAdded.items = items;
  addressesAdded.save();

  let setting = ensureAssetWhitelistSetting(event.params.comptrollerProxy.toHex(), policy);
  setting.listed = arrayUnique<string>(setting.listed.concat(items));
  setting.assets = setting.listed;
  setting.events = arrayUnique<string>(setting.events.concat([addressesAdded.id]));
  setting.timestamp = event.block.timestamp;
  setting.save();
}

export function handleAddressesRemoved(event: AddressesRemoved): void {
  let comptroller = ComptrollerLibContract.bind(event.params.comptrollerProxy);
  let vault = useVault(comptroller.getVaultProxy().toHex());
  let policy = ensurePolicy(event.address);
  let items = event.params.items.map<string>((item) => item.toHex());

  let addressesRemoved = new AssetWhitelistAddressesRemovedEvent(uniqueEventId(event));
  addressesRemoved.vault = vault.id;
  addressesRemoved.timestamp = event.block.timestamp;
  addressesRemoved.transaction = ensureTransaction(event).id;
  addressesRemoved.comptrollerProxy = event.params.comptrollerProxy.toHex();
  addressesRemoved.items = items;
  addressesRemoved.save();

  let setting = ensureAssetWhitelistSetting(event.params.comptrollerProxy.toHex(), policy);
  setting.listed = arrayDiff<string>(setting.listed, items);
  setting.assets = setting.listed;
  setting.events = arrayUnique<string>(setting.events.concat([addressesRemoved.id]));
  setting.timestamp = event.block.timestamp;
  setting.save();
}
