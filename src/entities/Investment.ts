import { BigDecimal, ethereum } from '@graphprotocol/graph-ts';
import { Account, Fund, Investment } from '../generated/schema';
import { arrayUnique } from '../utils/arrayUnique';
import { logCritical } from '../utils/logCritical';
import { trackNetworkInvestments } from './NetworkState';

function investmentId(investor: Account, fund: Fund): string {
  return fund.id + '/' + investor.id;
}

export function ensureInvestment(investor: Account, fund: Fund, stateId: string, event: ethereum.Event): Investment {
  let id = investmentId(investor, fund);

  let investment = Investment.load(id) as Investment;
  if (investment) {
    return investment;
  }

  investment = new Investment(id);
  investment.fund = fund.id;
  investment.investor = investor.id;
  investment.shares = BigDecimal.fromString('0');
  investment.state = stateId;
  investment.save();

  fund.investments = arrayUnique<string>(fund.investments.concat([id]));
  fund.investmentCount = fund.investments.length;
  fund.save();

  trackNetworkInvestments(event);

  return investment;
}

export function useInvestment(investor: Account, fund: Fund): Investment {
  let id = investmentId(investor, fund);
  let investment = Investment.load(id) as Investment;
  if (investment == null) {
    logCritical('Failed to load investment {}.', [id]);
  }

  return investment;
}

export function useInvestmentWithId(id: string): Investment {
  let investment = Investment.load(id) as Investment;
  if (investment == null) {
    logCritical('Failed to load investment {}.', [id]);
  }

  return investment;
}
