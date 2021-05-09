import { ensureAdapterWhitelistSetting } from '../entities/AdapterWhitelistSetting';
import { useFund } from '../entities/Fund';
import { ensurePolicy } from '../entities/Policy';
import { ensureTransaction } from '../entities/Transaction';
import { AddressesAdded, AddressesRemoved } from '../generated/AdapterWhitelistContract';
import { ComptrollerLibContract } from '../generated/ComptrollerLibContract';
import { AdapterWhitelistAddressesAddedEvent, AdapterWhitelistAddressesRemovedEvent } from '../generated/schema';
import { arrayDiff } from '../utils/arrayDiff';
import { arrayUnique } from '../utils/arrayUnique';
import { genericId } from '../utils/genericId';

export function handleAddressesAdded(event: AddressesAdded): void {
  let comptroller = ComptrollerLibContract.bind(event.params.comptrollerProxy);
  let vault = comptroller.getVaultProxy();
  let policy = ensurePolicy(event.address);
  let items = event.params.items.map<string>((item) => item.toHex());

  let addressesAdded = new AdapterWhitelistAddressesAddedEvent(genericId(event));
  addressesAdded.fund = vault.toHex(); // fund does not exist yet
  addressesAdded.timestamp = event.block.timestamp;
  addressesAdded.transaction = ensureTransaction(event).id;
  addressesAdded.comptrollerProxy = event.params.comptrollerProxy.toHex();
  addressesAdded.items = items;
  addressesAdded.save();

  let setting = ensureAdapterWhitelistSetting(event.params.comptrollerProxy.toHex(), policy);
  setting.listed = arrayUnique<string>(setting.listed.concat(items));
  setting.adapters = setting.listed;
  setting.events = arrayUnique<string>(setting.events.concat([addressesAdded.id]));
  setting.timestamp = event.block.timestamp;
  setting.save();
}

export function handleAddressesRemoved(event: AddressesRemoved): void {
  let comptroller = ComptrollerLibContract.bind(event.params.comptrollerProxy);
  let vault = comptroller.getVaultProxy();
  let fund = useFund(vault.toHex());
  let policy = ensurePolicy(event.address);
  let items = event.params.items.map<string>((item) => item.toHex());

  let addressesRemoved = new AdapterWhitelistAddressesRemovedEvent(genericId(event));
  addressesRemoved.fund = fund.id;
  addressesRemoved.timestamp = event.block.timestamp;
  addressesRemoved.transaction = ensureTransaction(event).id;
  addressesRemoved.comptrollerProxy = event.params.comptrollerProxy.toHex();
  addressesRemoved.items = items;
  addressesRemoved.save();

  let setting = ensureAdapterWhitelistSetting(event.params.comptrollerProxy.toHex(), policy);
  setting.listed = arrayDiff<string>(setting.listed, items);
  setting.adapters = setting.listed;
  setting.events = arrayUnique<string>(setting.events.concat([addressesRemoved.id]));
  setting.timestamp = event.block.timestamp;
  setting.save();
}
