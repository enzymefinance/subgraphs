import { Address } from '@graphprotocol/graph-ts';
import { Event, Fund, Version } from '../generated/schema';
import { Context, context } from '../context';
import { createFundEvent } from '../entities/Event';
import { FeeReward } from '../generated/FeeManagerContract';
import { ensureInvestment, createInvestmentReward } from '../entities/Investment';

export function handleFeeReward(event: FeeReward): void {
  if (!event.params.shareQuantity.isZero()) {
    let investment = ensureInvestment(context.entities.fund, context.entities.manager);
    createInvestmentReward(event, investment, event.params.shareQuantity);
  }

  createFundEvent('FeeReward', event, context);
}
