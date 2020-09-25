import { ensureManager, useManager } from '../entities/Account';
import { ensureAssetBlacklistSetting, useAssetBlacklistSetting } from '../entities/AssetBlacklistSetting';
import { useComptroller } from '../entities/Comptroller';
import { ensureContract, useContract } from '../entities/Contract';
import { useFund } from '../entities/Fund';
import { useAsset } from '../entities/Asset';
import { usePolicy } from '../entities/Policy';
import { ensureTransaction } from '../entities/Transaction';
import { AddressesAdded, AddressesRemoved } from '../generated/AssetBlacklistContract';
import { ComptrollerLibContract } from '../generated/ComptrollerLibContract';
import { AssetBlacklistAddressesAddedEvent, AssetBlacklistAddressesRemovedEvent } from '../generated/schema';
import { arrayDiff } from '../utils/arrayDiff';
import { arrayUnique } from '../utils/arrayUnique';
import { genericId } from '../utils/genericId';

export function handleAddressesAdded(event: AddressesAdded): void {
  let comptroller = ComptrollerLibContract.bind(event.params.comptrollerProxy);
  let vault = comptroller.getVaultProxy();
  let policy = usePolicy(event.address.toHex());
  let items = event.params.items.map<string>((item) => useAsset(item.toHex()).id);

  let addressesAdded = new AssetBlacklistAddressesAddedEvent(genericId(event));
  addressesAdded.fund = vault.toHex(); // fund does not exist yet
  addressesAdded.account = ensureManager(event.transaction.from, event).id;
  addressesAdded.contract = ensureContract(event.address, 'AssetBlacklist', event).id;
  addressesAdded.timestamp = event.block.timestamp;
  addressesAdded.transaction = ensureTransaction(event).id;
  addressesAdded.comptrollerProxy = useComptroller(event.params.comptrollerProxy.toHex()).id;
  addressesAdded.items = items;
  addressesAdded.save();

  let setting = ensureAssetBlacklistSetting(vault.toHex(), policy);
  setting.listed = arrayUnique<string>(setting.listed.concat(items));
  setting.events = arrayUnique<string>(setting.events.concat([addressesAdded.id]));
  setting.timestamp = event.block.timestamp;
  setting.save();
}

export function handleAddressesRemoved(event: AddressesRemoved): void {
  let comptroller = ComptrollerLibContract.bind(event.params.comptrollerProxy);
  let vault = comptroller.getVaultProxy();
  let fund = useFund(vault.toHex());
  let policy = usePolicy(event.address.toHex());
  let items = event.params.items.map<string>((item) => useAsset(item.toHex()).id);

  let addressesRemoved = new AssetBlacklistAddressesRemovedEvent(genericId(event));
  addressesRemoved.fund = fund.id;
  addressesRemoved.account = useManager(event.transaction.from.toHex()).id;
  addressesRemoved.contract = useContract(event.address.toHex()).id;
  addressesRemoved.timestamp = event.block.timestamp;
  addressesRemoved.transaction = ensureTransaction(event).id;
  addressesRemoved.comptrollerProxy = useComptroller(event.params.comptrollerProxy.toHex()).id;
  addressesRemoved.items = items;
  addressesRemoved.save();

  let setting = useAssetBlacklistSetting(fund, policy);
  setting.listed = arrayDiff<string>(setting.listed, items);
  setting.events = arrayUnique<string>(setting.events.concat([addressesRemoved.id]));
  setting.timestamp = event.block.timestamp;
  setting.save();
}
