import { BigInt, store, log } from '@graphprotocol/graph-ts';
import {
  Investment,
  InvestmentAddition,
  InvestmentRedemption,
  InvestmentRequest,
  Account,
  Asset,
  InvestmentReward,
} from '../generated/schema';
import { Context } from '../context';
import { logCritical } from '../utils/logCritical';
import { contractEventId } from './Event';

function investmentId(investor: Account, context: Context): string {
  let fund = context.entities.fund;
  return fund.id + '/' + investor.id;
}

function changeId(investment: Investment, context: Context): string {
  let event = context.event;
  let suffix = event.transaction.hash.toHex() + '/' + event.logIndex.toString();
  return investment.id + '/' + suffix;
}

export function ensureInvestment(investor: Account, context: Context): Investment {
  let id = investmentId(investor, context);
  let investment = Investment.load(id) as Investment;
  if (investment) {
    return investment;
  }

  let fund = context.entities.fund;
  investment = new Investment(id);
  investment.fund = fund.id;
  investment.investor = investor.id;
  investment.shares = BigInt.fromI32(0);
  investment.save();

  return investment;
}

export function useInvestment(investor: Account, context: Context): Investment {
  let id = investmentId(investor, context);
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
  quantity: BigInt,
  shares: BigInt,
  context: Context,
): InvestmentAddition {
  let event = context.event;

  let addition = new InvestmentAddition(changeId(investment, context));
  addition.kind = 'INVESTMENT';
  addition.investor = investment.investor;
  addition.fund = investment.fund;
  addition.version = context.entities.version.id;
  addition.investment = investment.id;
  addition.asset = asset.id;
  addition.quantity = quantity;
  addition.shares = shares;
  addition.timestamp = event.block.timestamp;
  addition.transaction = event.transaction.hash.toHex();
  addition.trigger = contractEventId(context);
  addition.save();

  investment.shares = investment.shares.plus(shares);
  investment.save();

  return addition;
}

export function createInvestmentRedemption(
  investment: Investment,
  assets: Asset[],
  quantities: BigInt[],
  shares: BigInt,
  context: Context,
): InvestmentRedemption {
  let event = context.event;

  let redemption = new InvestmentRedemption(changeId(investment, context));
  redemption.kind = 'REDEMPTION';
  redemption.investor = investment.investor;
  redemption.fund = investment.fund;
  redemption.version = context.entities.version.id;
  redemption.investment = investment.id;
  redemption.shares = shares;
  redemption.assets = assets.map<string>((item) => item.id);
  redemption.quantities = quantities;
  redemption.timestamp = event.block.timestamp;
  redemption.transaction = event.transaction.hash.toHex();
  redemption.trigger = contractEventId(context);
  redemption.save();

  investment.shares = investment.shares.minus(shares);
  investment.save();

  return redemption;
}

export function createInvestmentReward(investment: Investment, shares: BigInt, context: Context): InvestmentReward {
  let event = context.event;

  let reward = new InvestmentReward(changeId(investment, context));
  reward.kind = 'REWARD';
  reward.investor = investment.investor;
  reward.fund = investment.fund;
  reward.version = context.entities.version.id;
  reward.investment = investment.id;
  reward.shares = shares;
  reward.timestamp = event.block.timestamp;
  reward.transaction = event.transaction.hash.toHex();
  reward.trigger = contractEventId(context);
  reward.save();

  investment.shares = investment.shares.plus(shares);
  investment.save();

  return reward;
}

export function createInvestmentRequest(
  investor: Account,
  asset: Asset,
  quantity: BigInt,
  context: Context,
): InvestmentRequest {
  let event = context.event;
  let fund = context.entities.fund;

  let request = new InvestmentRequest(investmentId(investor, context));
  request.investor = investor.id;
  request.fund = fund.id;
  request.asset = asset.id;
  request.quantity = quantity;
  request.timestamp = event.block.timestamp;
  request.transaction = event.transaction.hash.toHex();
  request.save();

  return request;
}

export function deleteInvestmentRequest(investor: Account, context: Context): void {
  let id = investmentId(investor, context);
  if (InvestmentRequest.load(id)) {
    store.remove('InvestmentRequest', id);
  }
}
