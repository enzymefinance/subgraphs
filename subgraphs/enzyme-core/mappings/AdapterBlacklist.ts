import { arrayDiff, arrayUnique, uniqueEventId } from '@enzymefinance/subgraph-utils';
import { ensureAdapterBlacklistSetting } from '../entities/AdapterBlacklistSetting';
import { ensurePolicy } from '../entities/Policy';
import { ensureTransaction } from '../entities/Transaction';
import { useVault } from '../entities/Vault';
import { AddressesAdded, AddressesRemoved } from '../generated/AdapterBlacklistContract';
import { ComptrollerLibContract } from '../generated/ComptrollerLibContract';
import { AdapterBlacklistAddressesAddedEvent, AdapterBlacklistAddressesRemovedEvent } from '../generated/schema';

export function handleAddressesAdded(event: AddressesAdded): void {
  let comptroller = ComptrollerLibContract.bind(event.params.comptrollerProxy);
  let vault = comptroller.getVaultProxy();
  let policy = ensurePolicy(event.address);
  let items = event.params.items.map<string>((item) => item.toHex());

  let addressesAdded = new AdapterBlacklistAddressesAddedEvent(uniqueEventId(event));
  addressesAdded.vault = vault.toHex(); // fund does not exist yet
  addressesAdded.timestamp = event.block.timestamp;
  addressesAdded.transaction = ensureTransaction(event).id;
  addressesAdded.comptrollerProxy = event.params.comptrollerProxy.toHex();
  addressesAdded.items = items;
  addressesAdded.save();

  let setting = ensureAdapterBlacklistSetting(event.params.comptrollerProxy.toHex(), policy);
  setting.listed = arrayUnique<string>(setting.listed.concat(items));
  setting.adapters = setting.listed;
  setting.events = arrayUnique<string>(setting.events.concat([addressesAdded.id]));
  setting.timestamp = event.block.timestamp;
  setting.save();
}

export function handleAddressesRemoved(event: AddressesRemoved): void {
  let comptroller = ComptrollerLibContract.bind(event.params.comptrollerProxy);
  let vault = useVault(comptroller.getVaultProxy().toHex());
  let policy = ensurePolicy(event.address);
  let items = event.params.items.map<string>((item) => item.toHex());

  let addressesRemoved = new AdapterBlacklistAddressesRemovedEvent(uniqueEventId(event));
  addressesRemoved.vault = vault.id;
  addressesRemoved.timestamp = event.block.timestamp;
  addressesRemoved.transaction = ensureTransaction(event).id;
  addressesRemoved.comptrollerProxy = event.params.comptrollerProxy.toHex();
  addressesRemoved.items = items;
  addressesRemoved.save();

  let setting = ensureAdapterBlacklistSetting(event.params.comptrollerProxy.toHex(), policy);
  setting.listed = arrayDiff<string>(setting.listed, items);
  setting.adapters = setting.listed;
  setting.events = arrayUnique<string>(setting.events.concat([addressesRemoved.id]));
  setting.timestamp = event.block.timestamp;
  setting.save();
}
