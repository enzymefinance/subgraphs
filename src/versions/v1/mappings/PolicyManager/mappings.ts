import { Address } from '@graphprotocol/graph-ts';
import { ensureFund } from '../../utils/fund';
import { trackFundEvent } from '../../utils/event';
import {
  Registration,
  LogSetAuthority,
  LogSetOwner,
} from '../../generated/templates/v1/PolicyManagerContract/PolicyManagerContract';

export function handleLogSetAuthority(event: LogSetAuthority): void {
  trackFundEvent('LogSetAuthority', event, event.address);
  let fund = ensureFund(event.address);
}

export function handleLogSetOwner(event: LogSetOwner): void {
  trackFundEvent('LogSetOwner', event, event.address);
  let fund = ensureFund(event.address);
}

export function handleRegistration(event: Registration): void {
  trackFundEvent('Registration', event, event.address);
  let fund = ensureFund(event.address);
}
