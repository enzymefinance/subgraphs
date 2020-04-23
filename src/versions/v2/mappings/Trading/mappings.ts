import { Address } from '@graphprotocol/graph-ts';
import { ensureFund } from '../../utils/entities/fund';
import { trackFundEvent } from '../../utils/entities/event';
import {
  ExchangeMethodCall,
  LogSetAuthority,
  LogSetOwner,
  TradingContract,
} from '../../generated/templates/v2/TradingContract/TradingContract';

export function handleExchangeMethodCall(event: ExchangeMethodCall): void {
  let participationContract = TradingContract.bind(event.address);
  let hubAddress = participationContract.hub();
  trackFundEvent('ExchangeMethodCall', event, hubAddress);
  let fund = ensureFund(hubAddress);
}

export function handleLogSetAuthority(event: LogSetAuthority): void {
  let participationContract = TradingContract.bind(event.address);
  let hubAddress = participationContract.hub();
  trackFundEvent('LogSetAuthority', event, hubAddress);
  let fund = ensureFund(hubAddress);
}

export function handleLogSetOwner(event: LogSetOwner): void {
  let participationContract = TradingContract.bind(event.address);
  let hubAddress = participationContract.hub();
  trackFundEvent('LogSetOwner', event, hubAddress);
  let fund = ensureFund(hubAddress);
}
