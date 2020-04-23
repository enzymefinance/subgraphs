import { Address } from '@graphprotocol/graph-ts';
import { Event, Fund, Version } from '../generated/schema';
import { ensureFund } from '../entities/Fund';
import { trackFundEvent } from '../entities/Event';
import {
  AccountingContract,
  AmguPaid,
  AssetAddition,
  AssetRemoval,
  LogSetAuthority,
  LogSetOwner,
} from '../generated/v2/VersionContract/AccountingContract';

export function handleAmguPaid(event: AmguPaid): void {
  let accountingContract = AccountingContract.bind(event.address);
  let hubAddress = accountingContract.hub();

  let fund = ensureFund(hubAddress);
  trackFundEvent('AmguPaid', event, fund);
}

export function handleAssetAddition(event: AssetAddition): void {
  let accountingContract = AccountingContract.bind(event.address);
  let hubAddress = accountingContract.hub();

  let fund = ensureFund(hubAddress);
  trackFundEvent('AssetAddition', event, fund);
}

export function handleAssetRemoval(event: AssetRemoval): void {
  let accountingContract = AccountingContract.bind(event.address);
  let hubAddress = accountingContract.hub();

  let fund = ensureFund(hubAddress);
  trackFundEvent('AssetRemoval', event, fund);
}

export function handleLogSetAuthority(event: LogSetAuthority): void {
  let accountingContract = AccountingContract.bind(event.address);
  let hubAddress = accountingContract.hub();

  let fund = ensureFund(hubAddress);
  trackFundEvent('LogSetAuthority', event, fund);
}

export function handleLogSetOwner(event: LogSetOwner): void {
  let accountingContract = AccountingContract.bind(event.address);
  let hubAddress = accountingContract.hub();
  let fund = ensureFund(hubAddress);
  trackFundEvent('LogSetOwner', event, fund);
}
