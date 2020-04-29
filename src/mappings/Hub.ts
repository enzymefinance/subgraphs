import { dataSource } from '@graphprotocol/graph-ts';
import { Context } from '../context';
import { createFundEvent } from '../entities/Event';
import { FundShutDown } from '../generated/HubContract';

export function handleFundShutDown(event: FundShutDown): void {
  let context = new Context(dataSource.context(), event);
  context.entities.fund.active = false;
  context.entities.fund.save();

  createFundEvent('FundShutDown', context);
}
