import { Address } from '@graphprotocol/graph-ts';
import { Event, Fund, Version } from '../generated/schema';
import {
  EnableInvestment,
  AmguPaid,
  CancelRequest,
  DisableInvestment,
  InvestmentRequest,
  LogSetAuthority,
  LogSetOwner,
  Redemption,
  RequestExecution,
  ParticipationContract,
} from '../generated/templates/v2/ParticipationContract/ParticipationContract';
import {
  ensureInvestmentAddition,
  deleteInvestmentRequest,
  ensureInvestmentRequest,
  ensureInvestmentRedemption,
} from '../entities/Investment';
import { ensureFund } from '../entities/Fund';
import { trackFundEvent } from '../entities/Event';
import { ensureInvestor } from '../entities/Account';
import { ensureAsset } from '../entities/Asset';
import { Asset } from '../generated/schema';

export function handleAmguPaid(event: AmguPaid): void {
  let participationContract = ParticipationContract.bind(event.address);
  let hubAddress = participationContract.hub();
  let fund = ensureFund(hubAddress);
  trackFundEvent('AmguPaid', event, fund);
}

export function handleCancelRequest(event: CancelRequest): void {
  let participationContract = ParticipationContract.bind(event.address);
  let hubAddress = participationContract.hub();

  let fund = ensureFund(hubAddress);
  let account = ensureInvestor(event.params.requestOwner);

  deleteInvestmentRequest(fund, account);
  trackFundEvent('CancelRequest', event, fund);
}

export function handleDisableInvestment(event: DisableInvestment): void {
  let participationContract = ParticipationContract.bind(event.address);
  let hubAddress = participationContract.hub();
  let fund = ensureFund(hubAddress);
  trackFundEvent('DisableInvestment', event, fund);
}

export function handleEnableInvestment(event: EnableInvestment): void {
  let participationContract = ParticipationContract.bind(event.address);
  let hubAddress = participationContract.hub();
  let fund = ensureFund(hubAddress);
  trackFundEvent('EnableInvestment', event, fund);
}

export function handleInvestmentRequest(event: InvestmentRequest): void {
  let participationContract = ParticipationContract.bind(event.address);
  let hubAddress = participationContract.hub();

  let fund = ensureFund(hubAddress);
  let account = ensureInvestor(event.params.requestOwner);
  let asset = ensureAsset(event.params.investmentAsset);
  let quantity = event.params.investmentAmount;

  ensureInvestmentRequest(event, fund, account, asset, quantity);
  trackFundEvent('InvestmentRequest', event, fund);
}

export function handleLogSetAuthority(event: LogSetAuthority): void {
  let participationContract = ParticipationContract.bind(event.address);
  let hubAddress = participationContract.hub();
  let fund = ensureFund(hubAddress);
  trackFundEvent('LogSetAuthority', event, fund);
}

export function handleLogSetOwner(event: LogSetOwner): void {
  let participationContract = ParticipationContract.bind(event.address);
  let hubAddress = participationContract.hub();
  let fund = ensureFund(hubAddress);
  trackFundEvent('LogSetOwner', event, fund);
}

export function handleRedemption(event: Redemption): void {
  let participationContract = ParticipationContract.bind(event.address);
  let hubAddress = participationContract.hub();

  let fund = ensureFund(hubAddress);
  let account = ensureInvestor(event.params.redeemer);
  let assets = event.params.assets.map<Asset>((address) => ensureAsset(address));
  let shares = event.params.redeemedShares;
  let quantities = event.params.assetQuantities;

  ensureInvestmentRedemption(event, fund, account, assets, quantities, shares);
  trackFundEvent('Redemption', event, fund);
}

export function handleRequestExecution(event: RequestExecution): void {
  let participationContract = ParticipationContract.bind(event.address);
  let hubAddress = participationContract.hub();

  let fund = ensureFund(hubAddress);
  let account = ensureInvestor(event.params.requestOwner);
  let asset = ensureAsset(event.params.investmentAsset);
  let quantity = event.params.investmentAmount;
  let shares = event.params.requestedShares;

  deleteInvestmentRequest(fund, account);
  ensureInvestmentAddition(event, fund, account, asset, quantity, shares);
  trackFundEvent('RequestExecution', event, fund);
}
