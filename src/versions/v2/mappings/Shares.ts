import { Address } from '@graphprotocol/graph-ts';
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
  let participationContract = SharesContract.bind(event.address);
  let hubAddress = participationContract.hub();
  trackFundEvent('Approval', event, hubAddress);
  let fund = ensureFund(hubAddress);
}

export function handleLogSetAuthority(event: LogSetAuthority): void {
  let participationContract = SharesContract.bind(event.address);
  let hubAddress = participationContract.hub();
  trackFundEvent('LogSetAuthority', event, hubAddress);
  let fund = ensureFund(hubAddress);
}

export function handleLogSetOwner(event: LogSetOwner): void {
  let participationContract = SharesContract.bind(event.address);
  let hubAddress = participationContract.hub();
  trackFundEvent('LogSetOwner', event, hubAddress);
  let fund = ensureFund(hubAddress);
}

export function handleTransfer(event: Transfer): void {
  let participationContract = SharesContract.bind(event.address);
  let hubAddress = participationContract.hub();
  trackFundEvent('Transfer', event, hubAddress);
  let fund = ensureFund(hubAddress);
}
