import { Address } from '@graphprotocol/graph-ts';
import { Event, Fund, Version } from '../generated/schema';
import { ensureFund } from '../entities/Fund';
import { trackFundEvent } from '../entities/Event';
import {
  Transfer,
  Approval,
  LogSetAuthority,
  LogSetOwner,
  SharesContract,
} from '../generated/templates/v2/SharesContract/SharesContract';

export function handleApproval(event: Approval): void {
  let sharesContract = SharesContract.bind(event.address);
  let hubAddress = sharesContract.hub();
  let fund = ensureFund(hubAddress);
  trackFundEvent('Approval', event, fund);
}

export function handleLogSetAuthority(event: LogSetAuthority): void {
  let sharesContract = SharesContract.bind(event.address);
  let hubAddress = sharesContract.hub();
  let fund = ensureFund(hubAddress);
  trackFundEvent('LogSetAuthority', event, fund);
}

export function handleLogSetOwner(event: LogSetOwner): void {
  let sharesContract = SharesContract.bind(event.address);
  let hubAddress = sharesContract.hub();
  let fund = ensureFund(hubAddress);
  trackFundEvent('LogSetOwner', event, fund);
}

export function handleTransfer(event: Transfer): void {
  let sharesContract = SharesContract.bind(event.address);
  let hubAddress = sharesContract.hub();
  let fund = ensureFund(hubAddress);
  trackFundEvent('Transfer', event, fund);
}
