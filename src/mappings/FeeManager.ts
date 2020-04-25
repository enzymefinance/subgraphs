import { Address } from '@graphprotocol/graph-ts';
import { Event, Fund, Version } from '../generated/schema';
import { Context, context } from '../context';
import { createFundEvent } from '../entities/Event';
import { FeeReward } from '../generated/FeeManagerContract';

export function handleFeeReward(event: FeeReward): void {
  createFundEvent('FeeReward', event, context);
}
