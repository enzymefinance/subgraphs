import { Address } from '@graphprotocol/graph-ts';
import { Event, Fund, Version } from '../generated/schema';
import { Context, context } from '../context';
import { createFundEvent } from '../entities/Event';
import { ExchangeMethodCall } from '../generated/TradingContract';
import { updateFundHoldings, currentFundHoldings } from '../entities/Fund';
import { createTrade } from '../entities/Trade';
import { useAsset } from '../entities/Asset';

export function handleExchangeMethodCall(event: ExchangeMethodCall): void {
  let holdingsPreTrade = context.entities.fund.holdings;
  updateFundHoldings(event, context);
  let holdingsPostTrade = currentFundHoldings(event, context);

  createTrade(event, holdingsPreTrade, holdingsPostTrade);

  createFundEvent('ExchangeMethodCall', event, context);
}
