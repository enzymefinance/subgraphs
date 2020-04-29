import { Address, dataSource } from '@graphprotocol/graph-ts';
import { Event, Fund, Version, FundHoldingsMetric, Asset } from '../generated/schema';
import { Context } from '../context';
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
import { trackFundShares, trackFundHoldings } from '../entities/FundMetrics';

export function handleCancelRequest(event: CancelRequest): void {
  let context = new Context(dataSource.context(), event);
  let account = ensureInvestor(event.params.requestOwner);

  deleteInvestmentRequest(account, context);
  createFundEvent('CancelRequest', context);
}

export function handleDisableInvestment(event: DisableInvestment): void {
  let context = new Context(dataSource.context(), event);
  let removed = event.params.assets.map<string>((item) => item.toHex());
  context.entities.fund.investable = arrayDiff<string>(context.entities.fund.investable, removed);
  context.entities.fund.save();

  createFundEvent('DisableInvestment', context);
}

export function handleEnableInvestment(event: EnableInvestment): void {
  let context = new Context(dataSource.context(), event);
  let added = event.params.asset.map<string>((item) => item.toHex());
  context.entities.fund.investable = arrayUnique<string>(context.entities.fund.investable.concat(added));
  context.entities.fund.save();

  createFundEvent('EnableInvestment', context);
}

export function handleInvestmentRequest(event: InvestmentRequest): void {
  let context = new Context(dataSource.context(), event);
  let account = ensureInvestor(event.params.requestOwner);
  let asset = useAsset(event.params.investmentAsset.toHex());
  let quantity = event.params.investmentAmount;

  createInvestmentRequest(account, asset, quantity, context);
  createFundEvent('InvestmentRequest', context);
}

export function handleRequestExecution(event: RequestExecution): void {
  let context = new Context(dataSource.context(), event);
  let account = ensureInvestor(event.params.requestOwner);
  let investment = ensureInvestment(account, context);
  let asset = useAsset(event.params.investmentAsset.toHex());
  let quantity = event.params.investmentAmount;
  let shares = event.params.requestedShares;
  let addition = createInvestmentAddition(investment, asset, quantity, shares, context);

  deleteInvestmentRequest(account, context);

  trackFundHoldings([asset], addition, context);
  trackFundShares(addition, context);
  // trackFundInvestments(event, fund, addition);

  createFundEvent('RequestExecution', context);
}

export function handleRedemption(event: Redemption): void {
  let context = new Context(dataSource.context(), event);
  let account = ensureInvestor(event.params.redeemer);
  let investment = ensureInvestment(account, context);
  let assets = event.params.assets.map<Asset>((item) => useAsset(item.toHex()));
  let shares = event.params.redeemedShares;
  let quantities = event.params.assetQuantities;

  let redemption = createInvestmentRedemption(investment, assets, quantities, shares, context);

  trackFundHoldings(assets, redemption, context);
  trackFundShares(redemption, context);
  // trackFundInvestments(event, fund, redemption);

  createFundEvent('Redemption', context);
}
