import { dataSource, BigDecimal } from '@graphprotocol/graph-ts';
import { Asset } from '../generated/schema';
import { Context } from '../context';
import { createContractEvent } from '../entities/Event';
import { ensureInvestor } from '../entities/Account';
import { useAsset } from '../entities/Asset';
import { arrayDiff } from '../utils/arrayDiff';
import { arrayUnique } from '../utils/arrayUnique';
import { toBigDecimal } from '../utils/tokenValue';
import {
  ensureInvestment,
  deleteInvestmentRequest,
  createInvestmentRequest,
  createInvestmentAddition as createSharesAddition,
  createInvestmentRedemption as createSharesRedemption,
} from '../entities/Investment';
import {
  CancelRequest,
  DisableInvestment,
  EnableInvestment,
  Redemption,
  RequestExecution,
  InvestmentRequest,
} from '../generated/ParticipationContract';

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
  let quantity = toBigDecimal(event.params.investmentAmount, asset.decimals);

  createInvestmentRequest(account, asset, quantity, context);
  createContractEvent('InvestmentRequest', context);
}

export function handleRequestExecution(event: RequestExecution): void {
  let context = new Context(dataSource.context(), event);
  let account = ensureInvestor(event.params.requestOwner);
  let investment = ensureInvestment(account, context);
  let asset = useAsset(event.params.investmentAsset.toHex());
  let quantity = toBigDecimal(event.params.investmentAmount, asset.decimals);
  let shares = toBigDecimal(event.params.requestedShares);

  deleteInvestmentRequest(account, context);
  createSharesAddition(investment, asset, quantity, shares, context);
  createContractEvent('RequestExecution', context);
}

export function handleRedemption(event: Redemption): void {
  let context = new Context(dataSource.context(), event);
  let account = ensureInvestor(event.params.redeemer);
  let investment = ensureInvestment(account, context);
  let shares = toBigDecimal(event.params.redeemedShares);
  let assets = event.params.assets.map<Asset>((id) => useAsset(id.toHex()));
  let qtys = event.params.assetQuantities;

  let quantities: BigDecimal[] = [];
  for (let i: i32 = 0; i < assets.length; i++) {
    quantities.push(toBigDecimal(qtys[i], assets[i].decimals));
  }

  createSharesRedemption(investment, assets, quantities, shares, context);
  createContractEvent('Redemption', context);
}
