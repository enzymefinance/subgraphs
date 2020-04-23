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
  let feeManagerContract = FeeManagerContract.bind(event.address);
  let hubAddress = feeManagerContract.hub();
  trackFundEvent('FeeRegistration', event, hubAddress);
  let fund = ensureFund(hubAddress);
}

export function handleFeeReward(event: FeeReward): void {
  let feeManagerContract = FeeManagerContract.bind(event.address);
  let hubAddress = feeManagerContract.hub();
  trackFundEvent('FeeReward', event, hubAddress);
  let fund = ensureFund(hubAddress);
}

export function handleLogSetAuthority(event: LogSetAuthority): void {
  let feeManagerContract = FeeManagerContract.bind(event.address);
  let hubAddress = feeManagerContract.hub();
  // trackFundEvent('LogSetAuthority', event, hubAddress);
  let fund = ensureFund(hubAddress);
}

export function handleLogSetOwner(event: LogSetOwner): void {
  let feeManagerContract = FeeManagerContract.bind(event.address);
  let hubAddress = feeManagerContract.hub();
  // trackFundEvent('LogSetOwner', event, hubAddress);
  let fund = ensureFund(hubAddress);
}
