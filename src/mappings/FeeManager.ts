import { Address } from '@graphprotocol/graph-ts';
import { Event, Fund, Version } from '../generated/schema';
import { Context, context } from '../context';
import { createFundEvent } from '../entities/Event';
import { FeeReward } from '../generated/FeeManagerContract';
import { ensureInvestment, createInvestmentReward } from '../entities/Investment';
import { trackFundShares } from '../entities/FundMetrics';
import { updateFundInvestments } from '../entities/Fund';

export function handleFeeReward(event: FeeReward): void {
  if (!event.params.shareQuantity.isZero()) {
    let fund = context.entities.fund;
    let investment = ensureInvestment(context.entities.fund, context.entities.manager);
    let reward = createInvestmentReward(event, investment, event.params.shareQuantity);
    fund = updateFundInvestments(event, context);

    trackFundShares(event, fund, reward, context);
    // trackFundInvestments(event, fund, reward);
  }

  createFundEvent('FeeReward', event, context);
}
