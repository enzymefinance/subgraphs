import { Address } from '@graphprotocol/graph-ts';
import { ensureFund } from '../entities/Fund';
import { trackFundEvent } from '../entities/Event';
import {
  AmguPaid,
  AssetAddition,
  AssetRemoval,
  LogSetAuthority,
  LogSetOwner,
  AccountingContract,
} from '../generated/templates/v2/AccountingContract/AccountingContract';

export function handleAmguPaid(event: AmguPaid): void {
  let participationContract = AccountingContract.bind(event.address);
  let hubAddress = participationContract.hub();
  trackFundEvent('AmguPaid', event, hubAddress);
  let fund = ensureFund(hubAddress);
}

export function handleAssetAddition(event: AssetAddition): void {
  let participationContract = AccountingContract.bind(event.address);
  let hubAddress = participationContract.hub();
  trackFundEvent('AssetAddition', event, hubAddress);
  let fund = ensureFund(hubAddress);
}

export function handleAssetRemoval(event: AssetRemoval): void {
  let participationContract = AccountingContract.bind(event.address);
  let hubAddress = participationContract.hub();
  trackFundEvent('AssetRemoval', event, hubAddress);
  let fund = ensureFund(hubAddress);
}

export function handleLogSetAuthority(event: LogSetAuthority): void {
  let participationContract = AccountingContract.bind(event.address);
  let hubAddress = participationContract.hub();
  // trackFundEvent('LogSetAuthority', event, hubAddress);
  let fund = ensureFund(hubAddress);
}

export function handleLogSetOwner(event: LogSetOwner): void {
  let participationContract = AccountingContract.bind(event.address);
  let hubAddress = participationContract.hub();
  // trackFundEvent('LogSetOwner', event, hubAddress);
  let fund = ensureFund(hubAddress);
}
