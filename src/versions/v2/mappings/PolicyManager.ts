import { Address } from '@graphprotocol/graph-ts';
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
  // trackFundEvent('LogSetAuthority', event, hubAddress);
  let fund = ensureFund(hubAddress);
}

export function handleLogSetOwner(event: LogSetOwner): void {
  let policyManagerContract = PolicyManagerContract.bind(event.address);
  let hubAddress = policyManagerContract.hub();
  // trackFundEvent('LogSetOwner', event, hubAddress);
  let fund = ensureFund(hubAddress);
}

export function handleRegistration(event: Registration): void {
  let policyManagerContract = PolicyManagerContract.bind(event.address);
  let hubAddress = policyManagerContract.hub();
  trackFundEvent('Registration', event, hubAddress);
  let fund = ensureFund(hubAddress);
}
