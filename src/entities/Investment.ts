import { Address, BigInt, ethereum, store, log } from '@graphprotocol/graph-ts';
import {
  Investment,
  InvestmentAddition,
  InvestmentRedemption,
  InvestmentRequest,
  Fund,
  Account,
  Asset,
  InvestmentReward,
} from '../generated/schema';

function investmentId(fund: Fund, investor: Account): string {
  return fund.id + '/' + investor.id;
}

function changeId(event: ethereum.Event, investment: Investment): string {
  let suffix = event.transaction.hash.toHex() + '/' + event.logIndex.toString();
  return investment.id + '/' + suffix;
}

export function ensureInvestment(fund: Fund, investor: Account): Investment {
  let id = investmentId(fund, investor);
  let investment = Investment.load(id) as Investment;
  if (investment) {
    return investment;
  }

  investment = new Investment(id);
  investment.fund = fund.id;
  investment.investor = investor.id;
  investment.shares = BigInt.fromI32(0);
  investment.save();

  return investment;
}

export function useInvestment(fund: Fund, investor: Account): Investment {
  let id = investmentId(fund, investor);

  let investment = Investment.load(id);
  if (investment == null) {
    log.critical('Failed to load investment {}.', [id]);
  }

  return investment as Investment;
}

export function useInvestmentWithId(id: string): Investment {
  let investment = Investment.load(id);
  if (investment == null) {
    log.critical('Failed to load investment {}.', [id]);
  }

  return investment as Investment;
}

export function createInvestmentAddition(
  event: ethereum.Event,
  investment: Investment,
  asset: Asset,
  quantity: BigInt,
  shares: BigInt,
): InvestmentAddition {
  let addition = new InvestmentAddition(changeId(event, investment));
  addition.type = 'ADDITION';
  addition.investor = investment.investor;
  addition.fund = investment.fund;
  addition.investment = investment.id;
  addition.asset = asset.id;
  addition.quantity = quantity;
  addition.shares = shares;
  addition.timestamp = event.block.timestamp;
  addition.transaction = event.transaction.hash.toHex();
  addition.save();

  investment.shares = investment.shares.plus(shares);
  investment.save();

  return addition;
}

export function createInvestmentRedemption(
  event: ethereum.Event,
  investment: Investment,
  assets: string[],
  quantities: BigInt[],
  shares: BigInt,
): InvestmentRedemption {
  let redemption = new InvestmentRedemption(changeId(event, investment));
  redemption.type = 'REDEMPTION';
  redemption.investor = investment.investor;
  redemption.fund = investment.fund;
  redemption.investment = investment.id;
  redemption.assets = assets;
  redemption.quantities = quantities;
  redemption.shares = shares;
  redemption.timestamp = event.block.timestamp;
  redemption.transaction = event.transaction.hash.toHex();
  redemption.save();

  investment.shares = investment.shares.minus(shares);
  investment.save();

  return redemption;
}

export function createInvestmentReward(
  event: ethereum.Event,
  investment: Investment,
  shares: BigInt,
): InvestmentReward {
  let reward = new InvestmentReward(changeId(event, investment));
  reward.type = 'REWARD';
  reward.investor = investment.investor;
  reward.fund = investment.fund;
  reward.investment = investment.id;
  reward.shares = shares;
  reward.timestamp = event.block.timestamp;
  reward.transaction = event.transaction.hash.toHex();
  reward.save();

  investment.shares = investment.shares.plus(shares);
  investment.save();

  return reward;
}

export function createInvestmentRequest(
  event: ethereum.Event,
  fund: Fund,
  investor: Account,
  asset: Asset,
  quantity: BigInt,
): InvestmentRequest {
  let request = new InvestmentRequest(investmentId(fund, investor));
  request.investor = investor.id;
  request.fund = fund.id;
  request.asset = asset.id;
  request.quantity = quantity;
  request.timestamp = event.block.timestamp;
  request.transaction = event.transaction.hash.toHex();
  request.save();

  return request;
}

export function deleteInvestmentRequest(fund: Fund, investor: Account): void {
  let id = investmentId(fund, investor);
  if (InvestmentRequest.load(id)) {
    store.remove('InvestmentRequest', id);
  }
}
