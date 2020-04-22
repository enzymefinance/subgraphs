import { Address } from '@graphprotocol/graph-ts';
import { ensureFund } from '../../utils/fund';
import { trackFundEvent } from '../../utils/event';
import {
  AmguPaid,
  AssetAddition,
  AssetRemoval,
  LogSetAuthority,
  LogSetOwner,
} from '../../generated/templates/v2/AccountingContract/AccountingContract';

export function handleAmguPaid(event: AmguPaid): void {
  trackFundEvent('AmguPaid', event, event.address);
  let fund = ensureFund(event.address);
}

export function handleAssetAddition(event: AssetAddition): void {
  trackFundEvent('AssetAddition', event, event.address);
  let fund = ensureFund(event.address);
}

export function handleAssetRemoval(event: AssetRemoval): void {
  trackFundEvent('AssetRemoval', event, event.address);
  let fund = ensureFund(event.address);
}

export function handleLogSetAuthority(event: LogSetAuthority): void {
  trackFundEvent('LogSetAuthority', event, event.address);
  let fund = ensureFund(event.address);
}

export function handleLogSetOwner(event: LogSetOwner): void {
  trackFundEvent('LogSetOwner', event, event.address);
  let fund = ensureFund(event.address);
}
