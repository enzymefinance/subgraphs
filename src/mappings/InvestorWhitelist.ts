import { ensureAccount, ensureManager, useManager } from '../entities/Account';
import { ensureContract } from '../entities/Contract';
import { useFund } from '../entities/Fund';
import { ensureInvestorWhitelistSetting, useInvestorWhitelistSetting } from '../entities/InvestorWhitelistSetting';
import { usePolicy } from '../entities/Policy';
import { ensureTransaction } from '../entities/Transaction';
import { ComptrollerLibContract } from '../generated/ComptrollerLibContract';
import { AddressesAdded, AddressesRemoved } from '../generated/InvestorWhitelistContract';
import { InvestorWhitelistAddressesAddedEvent, InvestorWhitelistAddressesRemovedEvent } from '../generated/schema';
import { arrayDiff } from '../utils/arrayDiff';
import { arrayUnique } from '../utils/arrayUnique';
import { genericId } from '../utils/genericId';

export function handleAddressesAdded(event: AddressesAdded): void {
  // TODO: Instead of calling the contract, load the vault proxy from the fund / fund version entity.
  let comptroller = ComptrollerLibContract.bind(event.params.comptrollerProxy);
  let vault = comptroller.getVaultProxy();
  let policy = usePolicy(event.address.toHex());

  let newAddresses = event.params.items;
  let items: string[] = [];
  for (let i: i32 = 0; i < event.params.items.length; i++) {
    items = items.concat([ensureAccount(newAddresses[i], event).id]);
  }

  let addressesAdded = new InvestorWhitelistAddressesAddedEvent(genericId(event));
  addressesAdded.fund = vault.toHex(); // fund does not exist yet
  addressesAdded.account = ensureManager(event.transaction.from, event).id;
  addressesAdded.contract = ensureContract(event.address, 'InvestorWhitelist').id;
  addressesAdded.timestamp = event.block.timestamp;
  addressesAdded.transaction = ensureTransaction(event).id;
  addressesAdded.comptrollerProxy = event.params.comptrollerProxy.toHex();
  addressesAdded.items = items;
  addressesAdded.save();

  let setting = ensureInvestorWhitelistSetting(vault.toHex(), policy);
  setting.listed = arrayUnique<string>(setting.listed.concat(items));
  setting.events = arrayUnique<string>(setting.events.concat([addressesAdded.id]));
  setting.timestamp = event.block.timestamp;
  setting.save();
}

export function handleAddressesRemoved(event: AddressesRemoved): void {
  // TODO: Instead of calling the contract, load the vault proxy from the fund / fund version entity.
  let comptroller = ComptrollerLibContract.bind(event.params.comptrollerProxy);
  let vault = comptroller.getVaultProxy();
  let fund = useFund(vault.toHex());
  let policy = usePolicy(event.address.toHex());
  let items = event.params.items.map<string>((item) => ensureAccount(item, event).id);

  let addressesRemoved = new InvestorWhitelistAddressesRemovedEvent(genericId(event));
  addressesRemoved.fund = fund.id;
  addressesRemoved.account = useManager(event.transaction.from.toHex()).id;
  addressesRemoved.contract = event.address.toHex();
  addressesRemoved.timestamp = event.block.timestamp;
  addressesRemoved.transaction = ensureTransaction(event).id;
  addressesRemoved.comptrollerProxy = event.params.comptrollerProxy.toHex();
  addressesRemoved.items = items;
  addressesRemoved.save();

  let setting = useInvestorWhitelistSetting(fund, policy);
  setting.listed = arrayDiff<string>(setting.listed, items);
  setting.events = arrayUnique<string>(setting.events.concat([addressesRemoved.id]));
  setting.timestamp = event.block.timestamp;
  setting.save();
}
