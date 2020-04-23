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
  let accountingContract = AccountingContract.bind(event.address);
  let hubAddress = accountingContract.hub();
  trackFundEvent('AmguPaid', event, hubAddress);
  let fund = ensureFund(hubAddress);
}

export function handleAssetAddition(event: AssetAddition): void {
  let accountingContract = AccountingContract.bind(event.address);
  let hubAddress = accountingContract.hub();
  trackFundEvent('AssetAddition', event, hubAddress);
  let fund = ensureFund(hubAddress);
}

export function handleAssetRemoval(event: AssetRemoval): void {
  let accountingContract = AccountingContract.bind(event.address);
  let hubAddress = accountingContract.hub();
  trackFundEvent('AssetRemoval', event, hubAddress);
  let fund = ensureFund(hubAddress);
}

export function handleLogSetAuthority(event: LogSetAuthority): void {
  let accountingContract = AccountingContract.bind(event.address);
  let hubAddress = accountingContract.hub();
  // trackFundEvent('LogSetAuthority', event, hubAddress);
  let fund = ensureFund(hubAddress);
}

export function handleLogSetOwner(event: LogSetOwner): void {
  let accountingContract = AccountingContract.bind(event.address);
  let hubAddress = accountingContract.hub();
  // trackFundEvent('LogSetOwner', event, hubAddress);
  let fund = ensureFund(hubAddress);
}
