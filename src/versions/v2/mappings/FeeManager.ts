import { Address } from '@graphprotocol/graph-ts';
import { Event, Fund, Version } from '../generated/schema';
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

  let fund = ensureFund(hubAddress);
  trackFundEvent('FeeRegistration', event, fund);
}

export function handleFeeReward(event: FeeReward): void {
  let feeManagerContract = FeeManagerContract.bind(event.address);
  let hubAddress = feeManagerContract.hub();

  let fund = ensureFund(hubAddress);
  trackFundEvent('FeeReward', event, fund);
}

export function handleLogSetAuthority(event: LogSetAuthority): void {
  let feeManagerContract = FeeManagerContract.bind(event.address);
  let hubAddress = feeManagerContract.hub();

  let fund = ensureFund(hubAddress);
  trackFundEvent('LogSetAuthority', event, fund);
}

export function handleLogSetOwner(event: LogSetOwner): void {
  let feeManagerContract = FeeManagerContract.bind(event.address);
  let hubAddress = feeManagerContract.hub();

  let fund = ensureFund(hubAddress);
  trackFundEvent('LogSetOwner', event, fund);
}
