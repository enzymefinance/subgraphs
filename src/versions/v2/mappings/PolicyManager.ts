import { Address } from '@graphprotocol/graph-ts';
import { Event, Fund, Version } from '../generated/schema';
import { ensureFund } from '../entities/Fund';
import { trackFundEvent } from '../entities/Event';
import { ensurePolicy } from '../entities/Policy';
import {
  PolicyManagerContract,
  LogSetAuthority,
  LogSetOwner,
  Registration,
} from '../generated/v2/VersionContract/PolicyManagerContract';

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

  let policy = ensurePolicy(event, event.params.policy, fund);
}
