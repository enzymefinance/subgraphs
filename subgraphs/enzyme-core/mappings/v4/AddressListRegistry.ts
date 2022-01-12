import { arrayDiff, arrayUnique } from '@enzymefinance/subgraph-utils';
import { Bytes } from '@graphprotocol/graph-ts';
import { ensureAddressList } from '../../entities/AddressList';
import {
  ItemAddedToList,
  ItemRemovedFromList,
  ListAttested,
  ListCreated,
  ListOwnerSet,
  ListUpdateTypeSet,
} from '../../generated/contracts/AddressListRegistry4Events';
import { addressListUpdateType } from '../../utils/addressListUpdateType';

export function handleItemAddedToList(event: ItemAddedToList): void {
  let addressList = ensureAddressList(event.params.id.toString(), event);
  addressList.items = arrayUnique<Bytes>(addressList.items.concat([event.params.item as Bytes]));
  addressList.updatedAt = event.block.timestamp.toI32();
  addressList.save();
}

export function handleItemRemovedFromList(event: ItemRemovedFromList): void {
  let addressList = ensureAddressList(event.params.id.toString(), event);
  addressList.items = arrayDiff<Bytes>(addressList.items, [event.params.item as Bytes]);
  addressList.updatedAt = event.block.timestamp.toI32();
  addressList.save();
}

export function handleListCreated(event: ListCreated): void {
  let addressList = ensureAddressList(event.params.id.toString(), event);
  addressList.creator = event.params.creator;
  addressList.owner = event.params.owner;
  addressList.updateType = addressListUpdateType(event.params.updateType);
  addressList.updatedAt = event.block.timestamp.toI32();
  addressList.save();
}

export function handleListOwnerSet(event: ListOwnerSet): void {
  let addressList = ensureAddressList(event.params.id.toString(), event);
  addressList.owner = event.params.nextOwner;
  addressList.updatedAt = event.block.timestamp.toI32();
  addressList.save();
}

export function handleListUpdateTypeSet(event: ListUpdateTypeSet): void {
  let addressList = ensureAddressList(event.params.id.toString(), event);
  addressList.updateType = addressListUpdateType(event.params.nextUpdateType);
  addressList.updatedAt = event.block.timestamp.toI32();
  addressList.save();
}

export function handleListAttested(event: ListAttested): void {
  let addressList = ensureAddressList(event.params.id.toString(), event);
  addressList.description = event.params.description;
  addressList.updatedAt = event.block.timestamp.toI32();
  addressList.save();
}
