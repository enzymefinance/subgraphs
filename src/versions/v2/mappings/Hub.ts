import { Address } from '@graphprotocol/graph-ts';
import { Event, Fund, Version } from '../generated/schema';
import { ensureFund } from '../entities/Fund';
import { trackFundEvent } from '../entities/Event';
import {
  FundShutDown,
  LogForbid,
  LogPermit,
  LogSetAuthority,
  LogSetOwner,
} from '../generated/v2/VersionContract/HubContract';

export function handleFundShutDown(event: FundShutDown): void {
  let fund = ensureFund(event.address);
  fund.active = false;
  fund.save();

  trackFundEvent('FundShutDown', event, fund);
}

export function handleLogForbid(event: LogForbid): void {
  let fund = ensureFund(event.address);
  trackFundEvent('LogForbid', event, fund);
}

export function handleLogPermit(event: LogPermit): void {
  let fund = ensureFund(event.address);
  trackFundEvent('LogPermit', event, fund);
}

export function handleLogSetAuthority(event: LogSetAuthority): void {
  let fund = ensureFund(event.address);
  trackFundEvent('LogSetAuthority', event, fund);
}

export function handleLogSetOwner(event: LogSetOwner): void {
  let fund = ensureFund(event.address);
  trackFundEvent('LogSetOwner', event, fund);
}
