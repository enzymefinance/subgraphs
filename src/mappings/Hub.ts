import { Address } from '@graphprotocol/graph-ts';
import { Event, Fund, Version } from '../generated/schema';
import { Context, context } from '../context';
import { createFundEvent } from '../entities/Event';
import { FundShutDown } from '../generated/HubContract';

export function handleFundShutDown(event: FundShutDown): void {
  context.entities.fund.active = false;
  context.entities.fund.save();

  createFundEvent('FundShutDown', event, context);
}
