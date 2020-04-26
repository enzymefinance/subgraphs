import { Address } from '@graphprotocol/graph-ts';
import { Event, Fund, Version } from '../generated/schema';
import { Context, context } from '../context';
import { createFundEvent } from '../entities/Event';
import { FeeReward } from '../generated/FeeManagerContract';

export function handleFeeReward(event: FeeReward): void {
  // TODO: Add "REWARD" type to investment changes and allocate the rewarded fees
  // to the 'shares' quantity for the fund manager.
  createFundEvent('FeeReward', event, context);
}
