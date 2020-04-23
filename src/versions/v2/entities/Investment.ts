import { Address, BigInt, ethereum, store } from '@graphprotocol/graph-ts';
import {
  Investment,
  InvestmentAddition,
  InvestmentRedemption,
  InvestmentRequest,
  Fund,
  Account,
  Asset,
} from '../generated/schema';

function investmentId(fund: Fund, investor: Account): string {
  return fund.id + '/' + investor.id;
}

function changeId(event: ethereum.Event, fund: Fund, investor: Account): string {
  let scope = fund.id + '/' + investor.id;
  let suffix = event.transaction.hash.toHex() + '/' + event.logIndex.toString();
  return scope + '/' + suffix;
}

function ensureInvestment(fund: Fund, investor: Account): Investment {
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

export function ensureInvestmentAddition(
  event: ethereum.Event,
  fund: Fund,
  investor: Account,
  asset: Asset,
  quantity: BigInt,
  shares: BigInt,
): InvestmentAddition {
  let id = changeId(event, fund, investor);
  let addition = InvestmentAddition.load(id) as InvestmentAddition;
  if (addition) {
    return addition;
  }

  let investment = ensureInvestment(fund, investor);
  investment.shares = investment.shares.plus(shares);
  investment.save();

  addition = new InvestmentAddition(id);
  addition.investor = investor.id;
  addition.fund = fund.id;
  addition.investment = investment.id;
  addition.asset = asset.id;
  addition.quantity = quantity;
  addition.shares = shares;
  addition.timestamp = event.block.timestamp;
  addition.transaction = event.transaction.hash.toHex();
  addition.save();

  return addition;
}

export function ensureInvestmentRedemption(
  event: ethereum.Event,
  fund: Fund,
  investor: Account,
  assets: Asset[],
  quantities: BigInt[],
  shares: BigInt,
): InvestmentRedemption {
  let id = changeId(event, fund, investor);
  let redemption = InvestmentRedemption.load(id) as InvestmentRedemption;
  if (redemption) {
    return redemption;
  }

  let investment = ensureInvestment(fund, investor);
  investment.shares = investment.shares.minus(shares);
  investment.save();

  redemption = new InvestmentRedemption(id);
  redemption.investor = investor.id;
  redemption.fund = fund.id;
  redemption.investment = investment.id;
  redemption.assets = assets.map<string>((asset) => asset.id);
  redemption.quantities = quantities;
  redemption.shares = shares;
  redemption.timestamp = event.block.timestamp;
  redemption.transaction = event.transaction.hash.toHex();
  redemption.save();

  return redemption;
}

export function ensureInvestmentRequest(
  event: ethereum.Event,
  fund: Fund,
  investor: Account,
  asset: Asset,
  quantity: BigInt,
): InvestmentRequest {
  let investment = ensureInvestment(fund, investor);
  let request = InvestmentRequest.load(investment.id) as InvestmentRequest;
  if (request) {
    return request;
  }

  request = new InvestmentRequest(investment.id);
  request.investor = investor.id;
  request.fund = fund.id;
  request.investment = investment.id;
  request.asset = asset.id;
  request.quantity = quantity;
  request.timestamp = event.block.timestamp;
  request.transaction = event.transaction.hash.toHex();
  request.save();

  return request;
}

export function deleteInvestmentRequest(fund: Fund, investor: Account): void {
  let investment = ensureInvestment(fund, investor);

  if (InvestmentRequest.load(investment.id)) {
    store.remove('InvestmentRequest', investment.id);
  }
}
