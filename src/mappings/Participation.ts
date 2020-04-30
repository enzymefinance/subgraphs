import { dataSource } from '@graphprotocol/graph-ts';
import { Asset } from '../generated/schema';
import { Context } from '../context';
import { createContractEvent } from '../entities/Event';
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
import { trackFundShares, trackFundPortfolio } from '../entities/FundMetrics';

export function handleCancelRequest(event: CancelRequest): void {
  let context = new Context(dataSource.context(), event);
  let account = ensureInvestor(event.params.requestOwner);

  deleteInvestmentRequest(account, context);
  createContractEvent('CancelRequest', context);
}

export function handleDisableInvestment(event: DisableInvestment): void {
  let context = new Context(dataSource.context(), event);
  let fund = context.entities.fund;
  let removed = event.params.assets.map<string>((item) => item.toHex());
  fund.investable = arrayDiff<string>(fund.investable, removed);
  fund.save();

  createContractEvent('DisableInvestment', context);
}

export function handleEnableInvestment(event: EnableInvestment): void {
  let context = new Context(dataSource.context(), event);
  let fund = context.entities.fund;
  let added = event.params.asset.map<string>((item) => item.toHex());
  let previous = fund.investable;
  fund.investable = arrayUnique<string>(previous.concat(added));
  fund.save();

  createContractEvent('EnableInvestment', context);
}

export function handleInvestmentRequest(event: InvestmentRequest): void {
  let context = new Context(dataSource.context(), event);
  let account = ensureInvestor(event.params.requestOwner);
  let asset = useAsset(event.params.investmentAsset.toHex());
  let quantity = event.params.investmentAmount;

  createInvestmentRequest(account, asset, quantity, context);
  createContractEvent('InvestmentRequest', context);
}

export function handleRequestExecution(event: RequestExecution): void {
  let context = new Context(dataSource.context(), event);
  let account = ensureInvestor(event.params.requestOwner);
  let investment = ensureInvestment(account, context);
  let asset = useAsset(event.params.investmentAsset.toHex());
  let quantity = event.params.investmentAmount;
  let shares = event.params.requestedShares;
  let addition = createInvestmentAddition(investment, asset, quantity, shares, context);

  trackFundPortfolio([asset], addition, context);
  trackFundShares(addition, context);
  // trackFundInvestments(event, fund, addition);

  deleteInvestmentRequest(account, context);
  createContractEvent('RequestExecution', context);
}

export function handleRedemption(event: Redemption): void {
  let context = new Context(dataSource.context(), event);
  let account = ensureInvestor(event.params.redeemer);
  let investment = ensureInvestment(account, context);
  let assets = event.params.assets.map<Asset>((id) => useAsset(id.toHex()));
  let shares = event.params.redeemedShares;
  let quantities = event.params.assetQuantities;
  let redemption = createInvestmentRedemption(investment, assets, quantities, shares, context);

  trackFundPortfolio(assets, redemption, context);
  trackFundShares(redemption, context);
  // trackFundInvestments(event, fund, redemption);

  createContractEvent('Redemption', context);
}
