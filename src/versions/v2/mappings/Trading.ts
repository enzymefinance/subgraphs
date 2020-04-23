import { Address } from '@graphprotocol/graph-ts';
import { Event, Fund, Version } from '../generated/schema';
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
  let fund = ensureFund(hubAddress);
  trackFundEvent('ExchangeMethodCall', event, fund);
}

export function handleLogSetAuthority(event: LogSetAuthority): void {
  let tradingContract = TradingContract.bind(event.address);
  let hubAddress = tradingContract.hub();
  let fund = ensureFund(hubAddress);
  trackFundEvent('LogSetAuthority', event, fund);
}

export function handleLogSetOwner(event: LogSetOwner): void {
  let tradingContract = TradingContract.bind(event.address);
  let hubAddress = tradingContract.hub();
  let fund = ensureFund(hubAddress);
  trackFundEvent('LogSetOwner', event, fund);
}
