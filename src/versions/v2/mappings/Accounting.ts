import { Address } from '@graphprotocol/graph-ts';
import { Event, Fund, Version } from '../generated/schema';
import { ensureFund, updateFund } from '../entities/Fund';
import { trackFundEvent } from '../entities/Event';
import { AccountingContract, AssetAddition, AssetRemoval } from '../generated/v2/VersionContract/AccountingContract';

export function handleAssetAddition(event: AssetAddition): void {
  let accountingContract = AccountingContract.bind(event.address);
  let hubAddress = accountingContract.hub();

  let fund = updateFund(ensureFund(hubAddress));
  trackFundEvent('AssetAddition', event, fund);
}

export function handleAssetRemoval(event: AssetRemoval): void {
  let accountingContract = AccountingContract.bind(event.address);
  let hubAddress = accountingContract.hub();

  let fund = updateFund(ensureFund(hubAddress));
  trackFundEvent('AssetRemoval', event, fund);
}
