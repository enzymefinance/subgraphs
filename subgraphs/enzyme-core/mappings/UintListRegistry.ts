import { arrayDiff, arrayUnique } from '@enzymefinance/subgraph-utils';
import { ensureUintList } from '../entities/UintList';
import {
  ItemAddedToList,
  ItemRemovedFromList,
  ListAttested,
  ListCreated,
  ListOwnerSet,
  ListUpdateTypeSet,
} from '../generated/contracts/UintListRegistryEvents';
import { uintListUpdateType } from '../utils/uintListUpdateType';
import { BigInt } from '@graphprotocol/graph-ts';

export function handleItemAddedToList(event: ItemAddedToList): void {
  let uintList = ensureUintList(event.params.id.toString(), event);
  uintList.items = arrayUnique<BigInt>(uintList.items.concat([event.params.item]));
  uintList.updatedAt = event.block.timestamp.toI32();
  uintList.save();
}

export function handleItemRemovedFromList(event: ItemRemovedFromList): void {
  let uintList = ensureUintList(event.params.id.toString(), event);
  uintList.items = arrayDiff<BigInt>(uintList.items, [event.params.item]);
  uintList.updatedAt = event.block.timestamp.toI32();
  uintList.save();
}

export function handleListCreated(event: ListCreated): void {
  let uintList = ensureUintList(event.params.id.toString(), event);
  uintList.creator = event.params.creator;
  uintList.owner = event.params.owner;
  uintList.updateType = uintListUpdateType(event.params.updateType);
  uintList.updatedAt = event.block.timestamp.toI32();
  uintList.save();
}

export function handleListOwnerSet(event: ListOwnerSet): void {
  let uintList = ensureUintList(event.params.id.toString(), event);
  uintList.owner = event.params.nextOwner;
  uintList.updatedAt = event.block.timestamp.toI32();
  uintList.save();
}

export function handleListUpdateTypeSet(event: ListUpdateTypeSet): void {
  let uintList = ensureUintList(event.params.id.toString(), event);
  uintList.updateType = uintListUpdateType(event.params.nextUpdateType);
  uintList.updatedAt = event.block.timestamp.toI32();
  uintList.save();
}

export function handleListAttested(event: ListAttested): void {
  let uintList = ensureUintList(event.params.id.toString(), event);
  uintList.description = event.params.description;
  uintList.updatedAt = event.block.timestamp.toI32();
  uintList.save();
}
