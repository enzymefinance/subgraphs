import { arrayDiff, arrayUnique, uniqueEventId } from '@enzymefinance/subgraph-utils';
import { ensureAccount } from '../entities/Account';
import { ensureInvestorWhitelistSetting } from '../entities/InvestorWhitelistSetting';
import { ensurePolicy } from '../entities/Policy';
import { ensureTransaction } from '../entities/Transaction';
import { useVault } from '../entities/Vault';
import { ComptrollerLibContract } from '../generated/ComptrollerLibContract';
import { AddressesAdded, AddressesRemoved } from '../generated/InvestorWhitelistContract';
import { InvestorWhitelistAddressesAddedEvent, InvestorWhitelistAddressesRemovedEvent } from '../generated/schema';

export function handleAddressesAdded(event: AddressesAdded): void {
  let comptroller = ComptrollerLibContract.bind(event.params.comptrollerProxy);
  let vaultId = comptroller.getVaultProxy().toHex();
  let policy = ensurePolicy(event.address);

  let newAddresses = event.params.items;
  let items: string[] = new Array<string>();
  for (let i: i32 = 0; i < event.params.items.length; i++) {
    items = items.concat([ensureAccount(newAddresses[i], event).id]);
  }

  let addressesAdded = new InvestorWhitelistAddressesAddedEvent(uniqueEventId(event));
  addressesAdded.vault = vaultId; // fund may not exist yet
  addressesAdded.timestamp = event.block.timestamp;
  addressesAdded.transaction = ensureTransaction(event).id;
  addressesAdded.comptrollerProxy = event.params.comptrollerProxy.toHex();
  addressesAdded.items = items;
  addressesAdded.save();

  let setting = ensureInvestorWhitelistSetting(event.params.comptrollerProxy.toHex(), policy);
  setting.listed = arrayUnique<string>(setting.listed.concat(items));
  setting.events = arrayUnique<string>(setting.events.concat([addressesAdded.id]));
  setting.timestamp = event.block.timestamp;
  setting.save();
}

export function handleAddressesRemoved(event: AddressesRemoved): void {
  let comptroller = ComptrollerLibContract.bind(event.params.comptrollerProxy);
  let vaultAddress = comptroller.getVaultProxy();
  let vault = useVault(vaultAddress.toHex());
  let policy = ensurePolicy(event.address);
  let items = event.params.items.map<string>((item) => ensureAccount(item, event).id);

  let addressesRemoved = new InvestorWhitelistAddressesRemovedEvent(uniqueEventId(event));
  addressesRemoved.vault = vault.id;
  addressesRemoved.timestamp = event.block.timestamp;
  addressesRemoved.transaction = ensureTransaction(event).id;
  addressesRemoved.comptrollerProxy = event.params.comptrollerProxy.toHex();
  addressesRemoved.items = items;
  addressesRemoved.save();

  let setting = ensureInvestorWhitelistSetting(event.params.comptrollerProxy.toHex(), policy);
  setting.listed = arrayDiff<string>(setting.listed, items);
  setting.events = arrayUnique<string>(setting.events.concat([addressesRemoved.id]));
  setting.timestamp = event.block.timestamp;
  setting.save();
}
