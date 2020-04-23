import { Address } from '@graphprotocol/graph-ts';
import { ensureFund } from '../entities/Fund';
import { trackFundEvent } from '../entities/Event';
import {
  ExchangeMethodCall,
  LogSetAuthority,
  LogSetOwner,
  TradingContract,
} from '../generated/templates/v2/TradingContract/TradingContract';

export function handleExchangeMethodCall(event: ExchangeMethodCall): void {
  let tradingContract = TradingContract.bind(event.address);
  let hubAddress = tradingContract.hub();
  trackFundEvent('ExchangeMethodCall', event, hubAddress);
  let fund = ensureFund(hubAddress);
}

export function handleLogSetAuthority(event: LogSetAuthority): void {
  let tradingContract = TradingContract.bind(event.address);
  let hubAddress = tradingContract.hub();
  // trackFundEvent('LogSetAuthority', event, hubAddress);
  let fund = ensureFund(hubAddress);
}

export function handleLogSetOwner(event: LogSetOwner): void {
  let tradingContract = TradingContract.bind(event.address);
  let hubAddress = tradingContract.hub();
  // trackFundEvent('LogSetOwner', event, hubAddress);
  let fund = ensureFund(hubAddress);
}
