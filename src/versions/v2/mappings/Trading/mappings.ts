import { Address } from '@graphprotocol/graph-ts';
import { ensureFund } from '../../utils/fund';
import { trackFundEvent } from '../../utils/event';
import {
  ExchangeMethodCall,
  LogSetAuthority,
  LogSetOwner,
} from '../../generated/templates/v2/TradingContract/TradingContract';

export function handleExchangeMethodCall(event: ExchangeMethodCall): void {
  trackFundEvent('ExchangeMethodCall', event, event.address);
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
