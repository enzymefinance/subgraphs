import { Address } from '@graphprotocol/graph-ts';
import { Event, Fund, Version } from '../generated/schema';
import { ensureFund } from '../entities/Fund';
import { trackFundEvent } from '../entities/Event';
import {
  Registration,
  LogSetAuthority,
  LogSetOwner,
  PolicyManagerContract,
} from '../generated/templates/v2/PolicyManagerContract/PolicyManagerContract';

export function handleLogSetAuthority(event: LogSetAuthority): void {
  let policyManagerContract = PolicyManagerContract.bind(event.address);
  let hubAddress = policyManagerContract.hub();
  let fund = ensureFund(hubAddress);
  trackFundEvent('LogSetAuthority', event, fund);
}

export function handleLogSetOwner(event: LogSetOwner): void {
  let policyManagerContract = PolicyManagerContract.bind(event.address);
  let hubAddress = policyManagerContract.hub();
  let fund = ensureFund(hubAddress);
  trackFundEvent('LogSetOwner', event, fund);
}

export function handleRegistration(event: Registration): void {
  let policyManagerContract = PolicyManagerContract.bind(event.address);
  let hubAddress = policyManagerContract.hub();
  let fund = ensureFund(hubAddress);
  trackFundEvent('Registration', event, fund);
}
