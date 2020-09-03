import { BigDecimal, ethereum } from '@graphprotocol/graph-ts';
import { Investment, Account, Asset, Fund, SharesAddition, SharesRedemption } from '../generated/schema';
import { logCritical } from '../utils/logCritical';
import { contractEventId } from './Event';
import { trackFundShares } from './Shares';
import { useFund } from './Fund';

function investmentId(investor: Account, fund: Fund): string {
  return fund.id + '/' + investor.id;
}

function changeId(investment: Investment, event: ethereum.Event): string {
  let suffix = event.transaction.hash.toHex() + '/' + event.logIndex.toString();
  return investment.id + '/' + suffix;
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
  let investment = Investment.load(id);
  if (investment == null) {
    logCritical('Failed to load investment {}.', [id]);
  }

  return investment as Investment;
}

export function useInvestmentWithId(id: string): Investment {
  let investment = Investment.load(id);
  if (investment == null) {
    logCritical('Failed to load investment {}.', [id]);
  }

  return investment as Investment;
}

export function createInvestmentAddition(
  investment: Investment,
  asset: Asset,
  quantity: BigDecimal,
  shares: BigDecimal,
  event: ethereum.Event,
): SharesAddition {
  let addition = new SharesAddition(changeId(investment, event));
  addition.kind = 'INVESTMENT';
  addition.investor = investment.investor;
  addition.fund = investment.fund;
  addition.investment = investment.id;
  addition.asset = asset.id;
  addition.quantity = quantity;
  addition.shares = shares;
  addition.timestamp = event.block.timestamp;
  addition.transaction = event.transaction.hash.toHex();
  addition.trigger = contractEventId(event);
  addition.save();

  investment.shares = investment.shares.plus(shares);
  investment.save();

  // trackFundPortfolio(addition, context);
  trackFundShares(useFund(investment.fund), event, addition);
  // trackFundInvestments(event, fund, addition);

  return addition;
}

export function createInvestmentRedemption(
  investment: Investment,
  assets: Asset[],
  quantities: BigDecimal[],
  shares: BigDecimal,
  event: ethereum.Event,
): SharesRedemption {
  let redemption = new SharesRedemption(changeId(investment, event));
  redemption.kind = 'REDEMPTION';
  redemption.investor = investment.investor;
  redemption.fund = investment.fund;
  redemption.investment = investment.id;
  redemption.shares = shares;
  redemption.assets = assets.map<string>((item) => item.id);
  redemption.quantities = quantities;
  redemption.timestamp = event.block.timestamp;
  redemption.transaction = event.transaction.hash.toHex();
  redemption.trigger = contractEventId(event);
  redemption.save();

  investment.shares = investment.shares.minus(shares);
  investment.save();

  // trackFundPortfolio(redemption, context);
  trackFundShares(useFund(investment.fund), event, redemption);
  // trackFundInvestments(event, fund, redemption);

  return redemption;
}

// export function createInvestmentReward(investment: Investment, shares: BigDecimal, context: Context): SharesReward {
//   let event = context.event;

//   let reward = new SharesReward(changeId(investment, context));
//   reward.kind = 'REWARD';
//   reward.investor = investment.investor;
//   reward.fund = investment.fund;
//   reward.version = context.entities.version.id;
//   reward.investment = investment.id;
//   reward.shares = shares;
//   reward.timestamp = event.block.timestamp;
//   reward.transaction = event.transaction.hash.toHex();
//   reward.trigger = contractEventId(context);
//   reward.save();

//   investment.shares = investment.shares.plus(shares);
//   investment.save();

//   trackFundShares(reward, context);
//   trackPayout(shares, reward, context);
//   // trackFundInvestments(event, fund, reward);

//   return reward;
// }
