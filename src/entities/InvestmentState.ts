import { BigDecimal, ethereum } from '@graphprotocol/graph-ts';
import { Account, Fund, InvestmentState } from '../generated/schema';
import { logCritical } from '../utils/logCritical';
import { ensureInvestment } from './Investment';

function investmentStateId(investor: Account, fund: Fund, event: ethereum.Event): string {
  return fund.id + '/' + investor.id + '/' + event.block.timestamp.toString();
}

export function ensureInvestmentState(investor: Account, fund: Fund, event: ethereum.Event): InvestmentState {
  let id = investmentStateId(investor, fund, event);

  let investmentState = InvestmentState.load(id) as InvestmentState;
  if (investmentState) {
    return investmentState;
  }

  investmentState = new InvestmentState(id);
  investmentState.timestamp = event.block.timestamp;
  investmentState.fund = fund.id;
  investmentState.investor = investor.id;
  investmentState.shares = BigDecimal.fromString('0');
  investmentState.investment = ensureInvestment(investor, fund, id).id;
  investmentState.save();

  return investmentState;
}

export function useInvestmentState(investor: Account, fund: Fund, event: ethereum.Event): InvestmentState {
  let id = investmentStateId(investor, fund, event);

  let investmentState = InvestmentState.load(id) as InvestmentState;
  if (investmentState == null) {
    logCritical('Failed to load investment state {}.', [id]);
  }

  return investmentState;
}
