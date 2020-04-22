import { Address } from '@graphprotocol/graph-ts';
import { ensureFund } from '../../utils/fund';
import { trackFundEvent } from '../../utils/event';
import {
  FundShutDown,
  LogForbid,
  LogPermit,
  LogSetAuthority,
  LogSetOwner,
} from '../../generated/templates/v2/HubContract/HubContract';

export function handleFundShutDown(event: FundShutDown): void {
  trackFundEvent('FundShutDown', event, event.address);
  let fund = ensureFund(event.address);
  fund.active = false;
  fund.save();
}

export function handleLogForbid(event: LogForbid): void {
  trackFundEvent('LogForbid', event, event.address);
  let fund = ensureFund(event.address);
}

export function handleLogPermit(event: LogPermit): void {
  trackFundEvent('LogPermit', event, event.address);
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
