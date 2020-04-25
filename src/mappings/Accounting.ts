import { Address } from '@graphprotocol/graph-ts';
import { Event, Fund, Version } from '../generated/schema';
import { Context, context } from '../context';
import { createFundEvent } from '../entities/Event';
import { AssetAddition, AssetRemoval } from '../generated/AccountingContract';

export function handleAssetAddition(event: AssetAddition): void {
  createFundEvent('AssetAddition', event, context);
}

export function handleAssetRemoval(event: AssetRemoval): void {
  createFundEvent('AssetRemoval', event, context);
}
