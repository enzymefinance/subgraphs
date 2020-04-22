import { Address } from '@graphprotocol/graph-ts';
import { ensureFund } from '../../utils/fund';
import { trackFundEvent } from '../../utils/event';
import {
  Transfer,
  Approval,
  LogSetAuthority,
  LogSetOwner,
} from '../../generated/templates/v2/SharesContract/SharesContract';

export function handleApproval(event: Approval): void {
  trackFundEvent('Approval', event, event.address);
  let fund = ensureFund(event.address);
}

export function handleLogSetAuthority(event: LogSetAuthority): void {
  trackFundEvent('LogSetAuthority', event, event.address);
  let fund = ensureFund(event.address);
}

export function handleLogSetOwner(event: LogSetOwner): void {
  trackFundEvent('LogSetOwner', event, event.address);
  let fund = ensureFund(event.address);
}

export function handleTransfer(event: Transfer): void {
  trackFundEvent('Transfer', event, event.address);
  let fund = ensureFund(event.address);
}
