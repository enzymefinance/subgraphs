import { Address, dataSource } from '@graphprotocol/graph-ts';
import { Event, Fund, Version } from '../generated/schema';
import { Context } from '../context';
import { createFundEvent } from '../entities/Event';
import { FeeReward } from '../generated/FeeManagerContract';
import { ensureInvestment, createInvestmentReward } from '../entities/Investment';
import { trackFundShares } from '../entities/FundMetrics';

export function handleFeeReward(event: FeeReward): void {
  let context = new Context(dataSource.context(), event);

  if (!event.params.shareQuantity.isZero()) {
    let investment = ensureInvestment(context.entities.manager, context);
    let reward = createInvestmentReward(investment, event.params.shareQuantity, context);

    trackFundShares(reward, context);
    // trackFundInvestments(event, fund, reward);
  }

  createFundEvent('FeeReward', context);
}
