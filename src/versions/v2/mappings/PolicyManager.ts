import { Address } from '@graphprotocol/graph-ts';
import { Event, Fund, Version } from '../generated/schema';
import { ensureFund } from '../entities/Fund';
import { trackFundEvent } from '../entities/Event';
import { ensurePolicy } from '../entities/Policy';
import { PolicyManagerContract, Registration } from '../generated/v2/VersionContract/PolicyManagerContract';

export function handleRegistration(event: Registration): void {
  let policyManagerContract = PolicyManagerContract.bind(event.address);
  let hubAddress = policyManagerContract.hub();
  let fund = ensureFund(hubAddress);
  ensurePolicy(event, event.params.policy, fund);
  trackFundEvent('Registration', event, fund);
}
