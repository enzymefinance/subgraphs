import { Address } from '@graphprotocol/graph-ts';
import { Event, Fund, Version } from '../generated/schema';
import {
  ensureInvestmentAddition,
  deleteInvestmentRequest,
  ensureInvestmentRequest,
  ensureInvestmentRedemption,
} from '../entities/Investment';
import { ensureFund, updateFund } from '../entities/Fund';
import { trackFundEvent } from '../entities/Event';
import { ensureInvestor } from '../entities/Account';
import { ensureAsset, ensureAssets } from '../entities/Asset';
import { ensureVersion } from '../entities/Version';
import {
  ParticipationContract,
  CancelRequest,
  DisableInvestment,
  EnableInvestment,
  Redemption,
  RequestExecution,
  InvestmentRequest,
} from '../generated/v2/VersionContract/ParticipationContract';

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

  let fund = updateFund(ensureFund(hubAddress));
  trackFundEvent('DisableInvestment', event, fund);
}

export function handleEnableInvestment(event: EnableInvestment): void {
  let participationContract = ParticipationContract.bind(event.address);
  let hubAddress = participationContract.hub();

  let fund = updateFund(ensureFund(hubAddress));
  trackFundEvent('EnableInvestment', event, fund);
}

export function handleInvestmentRequest(event: InvestmentRequest): void {
  let participationContract = ParticipationContract.bind(event.address);
  let hubAddress = participationContract.hub();

  let fund = ensureFund(hubAddress);
  let version = ensureVersion(Address.fromString(fund.version));
  let account = ensureInvestor(event.params.requestOwner);
  let asset = ensureAsset(event.params.investmentAsset, version);
  let quantity = event.params.investmentAmount;

  ensureInvestmentRequest(event, fund, account, asset, quantity);
  trackFundEvent('InvestmentRequest', event, fund);
}

export function handleRedemption(event: Redemption): void {
  let participationContract = ParticipationContract.bind(event.address);
  let hubAddress = participationContract.hub();

  let fund = ensureFund(hubAddress);
  let version = ensureVersion(Address.fromString(fund.version));
  let assets = ensureAssets(event.params.assets, version);
  let account = ensureInvestor(event.params.redeemer);
  let shares = event.params.redeemedShares;
  let quantities = event.params.assetQuantities;

  ensureInvestmentRedemption(event, fund, account, assets, quantities, shares);
  trackFundEvent('Redemption', event, fund);
}

export function handleRequestExecution(event: RequestExecution): void {
  let participationContract = ParticipationContract.bind(event.address);
  let hubAddress = participationContract.hub();

  let fund = ensureFund(hubAddress);
  let version = ensureVersion(Address.fromString(fund.version));
  let account = ensureInvestor(event.params.requestOwner);
  let asset = ensureAsset(event.params.investmentAsset, version);
  let quantity = event.params.investmentAmount;
  let shares = event.params.requestedShares;

  ensureInvestmentAddition(event, fund, account, asset, quantity, shares);
  trackFundEvent('RequestExecution', event, fund);
}
