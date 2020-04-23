import { Address } from '@graphprotocol/graph-ts';
import { ensureFund } from '../entities/Fund';
import { trackFundEvent } from '../entities/Event';
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
import { ensureParticipation } from '../entities/Participation';

export function handleAmguPaid(event: AmguPaid): void {
  let participationContract = ParticipationContract.bind(event.address);
  let hubAddress = participationContract.hub();
  trackFundEvent('AmguPaid', event, hubAddress);
  let fund = ensureFund(hubAddress);
}

export function handleCancelRequest(event: CancelRequest): void {
  let participationContract = ParticipationContract.bind(event.address);
  let hubAddress = participationContract.hub();
  trackFundEvent('CancelRequest', event, event.address);
  let fund = ensureFund(hubAddress);
  let participation = ensureParticipation(event.params.requestOwner, hubAddress);
}

export function handleDisableInvestment(event: DisableInvestment): void {
  let participationContract = ParticipationContract.bind(event.address);
  let hubAddress = participationContract.hub();
  trackFundEvent('DisableInvestment', event, hubAddress);
  let fund = ensureFund(hubAddress);
}

export function handleEnableInvestment(event: EnableInvestment): void {
  let participationContract = ParticipationContract.bind(event.address);
  let hubAddress = participationContract.hub();
  trackFundEvent('EnableInvestment', event, hubAddress);
  let fund = ensureFund(hubAddress);
}

export function handleInvestmentRequest(event: InvestmentRequest): void {
  let participationContract = ParticipationContract.bind(event.address);
  let hubAddress = participationContract.hub();
  trackFundEvent('InvestmentRequest', event, hubAddress);
  let fund = ensureFund(hubAddress);
  let participation = ensureParticipation(event.params.requestOwner, hubAddress);
}

export function handleLogSetAuthority(event: LogSetAuthority): void {
  let participationContract = ParticipationContract.bind(event.address);
  let hubAddress = participationContract.hub();
  // trackFundEvent('LogSetAuthority', event, hubAddress);
  let fund = ensureFund(hubAddress);
}

export function handleLogSetOwner(event: LogSetOwner): void {
  let participationContract = ParticipationContract.bind(event.address);
  let hubAddress = participationContract.hub();
  // trackFundEvent('LogSetOwner', event, hubAddress);
  let fund = ensureFund(hubAddress);
}

export function handleRedemption(event: Redemption): void {
  let participationContract = ParticipationContract.bind(event.address);
  let hubAddress = participationContract.hub();
  trackFundEvent('Redemption', event, hubAddress);
  let fund = ensureFund(hubAddress);
}

export function handleRequestExecution(event: RequestExecution): void {
  let participationContract = ParticipationContract.bind(event.address);
  let hubAddress = participationContract.hub();
  trackFundEvent('RequestExecution', event, hubAddress);
  let fund = ensureFund(hubAddress);
  let participation = ensureParticipation(event.params.requestOwner, hubAddress);
}
