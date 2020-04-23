import { Address } from '@graphprotocol/graph-ts';
import { Event, Fund, Version } from '../generated/schema';
import { AmguPaid, LogSetAuthority, LogSetOwner, NewFund } from '../generated/v2/VersionContract/VersionContract';
import { ensureVersion } from '../entities/Version';
import { trackVersionEvent, trackFundEvent } from '../entities/Event';
import { ensureFund } from '../entities/Fund';

export function handleAmguPaid(event: AmguPaid): void {
  let version = ensureVersion(event.address);
  trackVersionEvent('AmguPaid', event, version);
}

export function handleLogSetAuthority(event: LogSetAuthority): void {
  let version = ensureVersion(event.address);
  trackVersionEvent('LogSetAuthority', event, version);
}

export function handleLogSetOwner(event: LogSetOwner): void {
  let version = ensureVersion(event.address);
  trackVersionEvent('LogSetOwner', event, version);
}

export function handleNewFund(event: NewFund): void {
  let version = ensureVersion(event.address);
  let fund = ensureFund(event.params.hub);
  trackFundEvent('NewFund', event, fund);
}
