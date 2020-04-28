import { Address } from '@graphprotocol/graph-ts';
import { Event, Fund, Version, FundHoldingsMetric } from '../generated/schema';
import { Context, context } from '../context';
import { createFundEvent } from '../entities/Event';
import { ensureInvestor } from '../entities/Account';
import { useAsset } from '../entities/Asset';
import { arrayDiff } from '../utils/arrayDiff';
import { arrayUnique } from '../utils/arrayUnique';
import {
  ensureInvestment,
  deleteInvestmentRequest,
  createInvestmentRequest,
  createInvestmentAddition,
  createInvestmentRedemption,
} from '../entities/Investment';
import {
  CancelRequest,
  DisableInvestment,
  EnableInvestment,
  Redemption,
  RequestExecution,
  InvestmentRequest,
} from '../generated/ParticipationContract';
import { updateFundHoldings, updateFundInvestments } from '../entities/Fund';
import { trackFundHoldings, trackFundShares, trackFundInvestments } from '../entities/FundMetrics';

export function handleCancelRequest(event: CancelRequest): void {
  let account = ensureInvestor(event.params.requestOwner);

  deleteInvestmentRequest(context.entities.fund, account);
  createFundEvent('CancelRequest', event, context);
}

export function handleDisableInvestment(event: DisableInvestment): void {
  let removed = event.params.assets.map<string>((item) => item.toHex());
  context.entities.fund.investable = arrayDiff<string>(context.entities.fund.investable, removed);
  context.entities.fund.save();

  createFundEvent('DisableInvestment', event, context);
}

export function handleEnableInvestment(event: EnableInvestment): void {
  let added = event.params.asset.map<string>((item) => item.toHex());
  context.entities.fund.investable = arrayUnique<string>(context.entities.fund.investable.concat(added));
  context.entities.fund.save();

  createFundEvent('EnableInvestment', event, context);
}

export function handleInvestmentRequest(event: InvestmentRequest): void {
  let account = ensureInvestor(event.params.requestOwner);
  let asset = useAsset(event.params.investmentAsset.toHex());
  let quantity = event.params.investmentAmount;

  createInvestmentRequest(event, context.entities.fund, account, asset, quantity);
  createFundEvent('InvestmentRequest', event, context);
}

export function handleRequestExecution(event: RequestExecution): void {
  let account = ensureInvestor(event.params.requestOwner);
  let investment = ensureInvestment(context.entities.fund, account);
  let asset = useAsset(event.params.investmentAsset.toHex());
  let quantity = event.params.investmentAmount;
  let shares = event.params.requestedShares;

  let addition = createInvestmentAddition(event, investment, asset, quantity, shares);
  let fund = updateFundHoldings(event, context);
  fund = updateFundInvestments(event, context);

  deleteInvestmentRequest(fund, account);

  trackFundHoldings(event, fund, addition);
  trackFundShares(event, fund, addition);
  trackFundInvestments(event, fund, addition);

  createFundEvent('RequestExecution', event, context);
}

export function handleRedemption(event: Redemption): void {
  let account = ensureInvestor(event.params.redeemer);
  let investment = ensureInvestment(context.entities.fund, account);
  let assets = event.params.assets.map<string>((item) => item.toHex());
  let shares = event.params.redeemedShares;
  let quantities = event.params.assetQuantities;

  let redemption = createInvestmentRedemption(event, investment, assets, quantities, shares);
  let fund = updateFundHoldings(event, context);
  fund = updateFundInvestments(event, context);

  trackFundHoldings(event, fund, redemption);
  trackFundShares(event, fund, redemption);
  trackFundInvestments(event, fund, redemption);

  createFundEvent('Redemption', event, context);
}
