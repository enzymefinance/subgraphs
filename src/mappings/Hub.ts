import { dataSource } from '@graphprotocol/graph-ts';
import { Context } from '../context';
import { createContractEvent } from '../entities/Event';
import { FundShutDown } from '../generated/HubContract';

export function handleFundShutDown(event: FundShutDown): void {
  let context = new Context(dataSource.context(), event);
  let fund = context.entities.fund;
  fund.active = false;
  fund.save();

  createContractEvent('FundShutDown', context);
}
