import { Address } from '@graphprotocol/graph-ts';
import { ensureFund } from '../entities/Fund';
import { trackFundEvent } from '../entities/Event';
import {
  FeeRegistration,
  FeeReward,
  LogSetAuthority,
  LogSetOwner,
  FeeManagerContract,
} from '../generated/templates/v2/FeeManagerContract/FeeManagerContract';

export function handleFeeRegistration(event: FeeRegistration): void {
  let participationContract = FeeManagerContract.bind(event.address);
  let hubAddress = participationContract.hub();
  trackFundEvent('FeeRegistration', event, hubAddress);
  let fund = ensureFund(hubAddress);
}

export function handleFeeReward(event: FeeReward): void {
  let participationContract = FeeManagerContract.bind(event.address);
  let hubAddress = participationContract.hub();
  trackFundEvent('FeeReward', event, hubAddress);
  let fund = ensureFund(hubAddress);
}

export function handleLogSetAuthority(event: LogSetAuthority): void {
  let participationContract = FeeManagerContract.bind(event.address);
  let hubAddress = participationContract.hub();
  // trackFundEvent('LogSetAuthority', event, hubAddress);
  let fund = ensureFund(hubAddress);
}

export function handleLogSetOwner(event: LogSetOwner): void {
  let participationContract = FeeManagerContract.bind(event.address);
  let hubAddress = participationContract.hub();
  // trackFundEvent('LogSetOwner', event, hubAddress);
  let fund = ensureFund(hubAddress);
}
