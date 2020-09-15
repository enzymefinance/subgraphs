import { BigDecimal, ethereum } from '@graphprotocol/graph-ts';
import { Account, Asset, Fund, Investment, SharesBoughtEvent, SharesRedeemedEvent } from '../generated/schema';
import { logCritical } from '../utils/logCritical';
import { useFund } from './Fund';
import { trackFundPortfolio } from './Portfolio';
import { trackFundShares } from './Shares';
import { ensureTransaction } from './Transaction';
import { ensureContract } from './Contract';

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
): SharesBoughtEvent {
  let addition = new SharesBoughtEvent(changeId(investment, event));
  addition.account = investment.investor;
  addition.investor = investment.investor;
  addition.fund = investment.fund;
  addition.contract = ensureContract(event.address, 'ComptrollerLib', event).id;
  addition.investment = investment.id;
  addition.asset = asset.id;
  addition.quantity = quantity;
  addition.shares = shares;
  addition.timestamp = event.block.timestamp;
  addition.transaction = ensureTransaction(event).id;
  addition.save();

  investment.shares = investment.shares.plus(shares);
  investment.save();

  let fund = useFund(investment.fund);

  trackFundPortfolio(fund, event, addition);
  trackFundShares(fund, event, addition);
  // trackFundInvestments(event, fund, addition);

  return addition;
}

export function createInvestmentRedemption(
  investment: Investment,
  assets: Asset[],
  quantities: BigDecimal[],
  shares: BigDecimal,
  event: ethereum.Event,
): SharesRedeemedEvent {
  let redemption = new SharesRedeemedEvent(changeId(investment, event));
  redemption.account = investment.investor;
  redemption.investor = investment.investor;
  redemption.fund = investment.fund;
  redemption.contract = ensureContract(event.address, 'ComptrollerLib', event).id;
  redemption.investment = investment.id;
  redemption.shares = shares;
  redemption.assets = assets.map<string>((item) => item.id);
  redemption.quantities = quantities;
  redemption.timestamp = event.block.timestamp;
  redemption.transaction = ensureTransaction(event).id;
  redemption.save();

  investment.shares = investment.shares.minus(shares);
  investment.save();

  let fund = useFund(investment.fund);

  trackFundPortfolio(fund, event, redemption);
  trackFundShares(fund, event, redemption);
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
