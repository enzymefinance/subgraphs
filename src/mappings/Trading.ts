import { Address } from '@graphprotocol/graph-ts';
import { Event, Fund, Version } from '../generated/schema';
import { Context, context } from '../context';
import { createFundEvent } from '../entities/Event';
import { ExchangeMethodCall } from '../generated/TradingContract';

export function handleExchangeMethodCall(event: ExchangeMethodCall): void {
  createFundEvent('ExchangeMethodCall', event, context);
}
