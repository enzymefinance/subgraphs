import { BigDecimal, ethereum } from '@graphprotocol/graph-ts';
import { Account, Asset, Fund, Investment } from '../generated/schema';
import { logCritical } from '../utils/logCritical';
import { useFund } from './Fund';
import { trackFundPortfolio } from './Portfolio';
import { trackFundShares } from './Shares';
import { ensureTransaction } from './Transaction';
import { ensureContract } from './Contract';
import { genericId } from '../utils/genericId';

function investmentId(investor: Account, fund: Fund): string {
  return fund.id + '/' + investor.id;
}

export function ensureInvestment(investor: Account, fund: Fund): Investment {
  let id = investmentId(investor, fund);

  let investment = Investment.load(id) as Investment;
  if (investment) {
    return investment;
  }

  investment = new Investment(id);
  investment.fund = fund.id;
  investment.investor = investor.id;
  investment.shares = BigDecimal.fromString('0');
  investment.save();

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

// export function createInvestmentReward(
//   investment: Investment,
//   asset: Asset,
//   quantity: BigDecimal,
//   shares: BigDecimal,
//   event: ethereum.Event,
// ): SharesRewardEvent {
//   let reward = new SharesRewardEvent(genericId(event));
//   reward.investor = investment.investor;
//   reward.fund = investment.fund;
//   reward.investment = investment.id;
//   reward.shares = shares;
//   reward.timestamp = event.block.timestamp;
//   reward.transaction = event.transaction.hash.toHex();

//   reward.save();

//   investment.shares = investment.shares.plus(shares);
//   investment.save();

//   let fund = useFund(investment.fund);

//   trackFundShares(fund, event, reward);
//   // trackPayout(shares, reward, context);
//   // trackFundInvestments(event, fund, reward);

//   return reward;
// }
