import { arrayDiff, arrayUnique } from '../../../utils/utils/array';
import { uniqueEventId } from '../../../utils/utils/id';
import { ensureBuySharesCallerWhitelistSetting } from '../entities/BuySharesCallerWhitelistSetting';
import { ensurePolicy } from '../entities/Policy';
import { ensureTransaction } from '../entities/Transaction';
import { useVault } from '../entities/Vault';
import { AddressesAdded, AddressesRemoved } from '../generated/BuySharesCallerWhitelistContract';
import { ComptrollerLibContract } from '../generated/ComptrollerLibContract';
import {
  BuySharesCallerWhitelistAddressesAddedEvent,
  BuySharesCallerWhitelistAddressesRemovedEvent,
} from '../generated/schema';

export function handleAddressesAdded(event: AddressesAdded): void {
  let comptroller = ComptrollerLibContract.bind(event.params.comptrollerProxy);
  let vaultId = comptroller.getVaultProxy().toHex();
  let policy = ensurePolicy(event.address);
  let items = event.params.items.map<string>((item) => item.toHex());

  let addressesAdded = new BuySharesCallerWhitelistAddressesAddedEvent(uniqueEventId(event));
  addressesAdded.vault = vaultId; // fund does not exist yet
  addressesAdded.timestamp = event.block.timestamp;
  addressesAdded.transaction = ensureTransaction(event).id;
  addressesAdded.comptrollerProxy = event.params.comptrollerProxy.toHex();
  addressesAdded.items = items;
  addressesAdded.save();

  let setting = ensureBuySharesCallerWhitelistSetting(event.params.comptrollerProxy.toHex(), policy);
  setting.listed = arrayUnique<string>(setting.listed.concat(items));
  setting.events = arrayUnique<string>(setting.events.concat([addressesAdded.id]));
  setting.timestamp = event.block.timestamp;
  setting.save();
}

export function handleAddressesRemoved(event: AddressesRemoved): void {
  let comptroller = ComptrollerLibContract.bind(event.params.comptrollerProxy);
  let vault = useVault(comptroller.getVaultProxy().toHex());
  let policy = ensurePolicy(event.address);
  let items = event.params.items.map<string>((item) => item.toHex());

  let addressesRemoved = new BuySharesCallerWhitelistAddressesRemovedEvent(uniqueEventId(event));
  addressesRemoved.vault = vault.id;
  addressesRemoved.timestamp = event.block.timestamp;
  addressesRemoved.transaction = ensureTransaction(event).id;
  addressesRemoved.comptrollerProxy = event.params.comptrollerProxy.toHex();
  addressesRemoved.items = items;
  addressesRemoved.save();

  let setting = ensureBuySharesCallerWhitelistSetting(event.params.comptrollerProxy.toHex(), policy);
  setting.listed = arrayDiff<string>(setting.listed, items);
  setting.events = arrayUnique<string>(setting.events.concat([addressesRemoved.id]));
  setting.timestamp = event.block.timestamp;
  setting.save();
}
