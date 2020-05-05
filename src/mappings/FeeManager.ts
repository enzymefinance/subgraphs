import { dataSource } from '@graphprotocol/graph-ts';
import { Context } from '../context';
import { createContractEvent } from '../entities/Event';
import { FeeReward } from '../generated/FeeManagerContract';
import { ensureInvestment, createInvestmentReward } from '../entities/Investment';
import { toBigDecimal } from '../utils/tokenValue';

export function handleFeeReward(event: FeeReward): void {
  let context = new Context(dataSource.context(), event);

  if (!event.params.shareQuantity.isZero()) {
    let investment = ensureInvestment(context.entities.manager, context);
    createInvestmentReward(investment, toBigDecimal(event.params.shareQuantity), context);
  }

  createContractEvent('FeeReward', context);
}
