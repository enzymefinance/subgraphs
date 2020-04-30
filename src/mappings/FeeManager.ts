import { dataSource } from '@graphprotocol/graph-ts';
import { Context } from '../context';
import { createContractEvent } from '../entities/Event';
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

  createContractEvent('FeeReward', context);
}
