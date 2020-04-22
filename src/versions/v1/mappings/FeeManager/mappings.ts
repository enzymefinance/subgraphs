import { Address } from '@graphprotocol/graph-ts';
import { ensureFund } from '../../utils/fund';
import { trackFundEvent } from '../../utils/event';
import {
  FeeRegistration,
  FeeReward,
  LogSetAuthority,
  LogSetOwner,
} from '../../generated/templates/v1/FeeManagerContract/FeeManagerContract';

export function handleFeeRegistration(event: FeeRegistration): void {
  trackFundEvent('FeeRegistration', event, event.address);
  let fund = ensureFund(event.address);
}

export function handleFeeReward(event: FeeReward): void {
  trackFundEvent('FeeReward', event, event.address);
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
