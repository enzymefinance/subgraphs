import { Address } from '@graphprotocol/graph-ts';
import { AmguPaid, LogSetAuthority, LogSetOwner, NewFund } from '../../generated/v2/VersionContract/VersionContract';
import { ensureVersion } from '../../utils/entities/version';
import { trackVersionEvent } from '../../utils/entities/event';
import { ensureFund } from '../../utils/entities/fund';

export function handleAmguPaid(event: AmguPaid): void {
  trackVersionEvent('AmguPaid', event, event.address);
  let version = ensureVersion(event.address);
}

export function handleLogSetAuthority(event: LogSetAuthority): void {
  trackVersionEvent('LogSetAuthority', event, event.address);
  let version = ensureVersion(event.address);
}

export function handleLogSetOwner(event: LogSetOwner): void {
  trackVersionEvent('LogSetOwner', event, event.address);
  let version = ensureVersion(event.address);
}

export function handleNewFund(event: NewFund): void {
  trackVersionEvent('NewFund', event, event.address);
  let version = ensureVersion(event.address);
  let fund = ensureFund(event.params.hub);
}
