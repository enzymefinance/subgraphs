import { Address } from '@graphprotocol/graph-ts';
import { Event, Fund, Version } from '../generated/schema';
import { ensureFund, updateFund } from '../entities/Fund';
import { trackFundEvent } from '../entities/Event';
import { FeeManagerContract, FeeRegistration, FeeReward } from '../generated/v2/VersionContract/FeeManagerContract';

export function handleFeeRegistration(event: FeeRegistration): void {
  let feeManagerContract = FeeManagerContract.bind(event.address);
  let hubAddress = feeManagerContract.hub();

  let fund = updateFund(ensureFund(hubAddress));
  trackFundEvent('FeeRegistration', event, fund);
}

export function handleFeeReward(event: FeeReward): void {
  let feeManagerContract = FeeManagerContract.bind(event.address);
  let hubAddress = feeManagerContract.hub();

  let fund = updateFund(ensureFund(hubAddress));
  trackFundEvent('FeeReward', event, fund);
}
