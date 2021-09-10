import { BigDecimal, ethereum } from '@graphprotocol/graph-ts';
import { ONE_BD, saveDivideBigDecimal } from '@enzymefinance/subgraph-utils';
import { Currency } from '../generated/schema';
import { createCurrencyRegistration, getUpdatedAggregator } from '../entities/Registration';
import { fetchLatestAnswer } from './fetchLatestAnswer';
import { getCurrencyAggregator } from './getCurrencyAggregator';

export function initializeCurrencies(event: ethereum.Event): void {
  if (Currency.load('USD') != null) {
    return;
  }

  createCurrencyRegistration('USD', event);
  createCurrencyRegistration('BTC', event);
  createCurrencyRegistration('EUR', event);
  createCurrencyRegistration('AUD', event);
  createCurrencyRegistration('CHF', event);
  createCurrencyRegistration('GBP', event);
  createCurrencyRegistration('JPY', event);

  let usdEth = fetchLatestCurrencyAggregatorAnswer('USD', event);
  createCurrency('USD', usdEth, ONE_BD, event);

  let btcUsd = fetchLatestCurrencyAggregatorAnswer('BTC', event);
  createCurrency('BTC', saveDivideBigDecimal(btcUsd, usdEth), btcUsd, event);

  let eurUsd = fetchLatestCurrencyAggregatorAnswer('EUR', event);
  createCurrency('EUR', saveDivideBigDecimal(eurUsd, usdEth), eurUsd, event);

  let audUsd = fetchLatestCurrencyAggregatorAnswer('AUD', event);
  createCurrency('AUD', saveDivideBigDecimal(audUsd, usdEth), audUsd, event);

  let chfUsd = fetchLatestCurrencyAggregatorAnswer('CHF', event);
  createCurrency('CHF', saveDivideBigDecimal(chfUsd, usdEth), chfUsd, event);

  let gbpUsd = fetchLatestCurrencyAggregatorAnswer('GBP', event);
  createCurrency('GBP', saveDivideBigDecimal(gbpUsd, usdEth), gbpUsd, event);

  let jpyUsd = fetchLatestCurrencyAggregatorAnswer('JPY', event);
  createCurrency('JPY', saveDivideBigDecimal(jpyUsd, usdEth), jpyUsd, event);
}

function createCurrency(id: string, eth: BigDecimal, usd: BigDecimal, event: ethereum.Event): void {
  let currency = new Currency(id);
  currency.updated = event.block.number.toI32();
  currency.usd = usd;
  currency.eth = eth;
  currency.save();
}

function fetchLatestCurrencyAggregatorAnswer(currency: string, event: ethereum.Event): BigDecimal {
  let aggregator = getUpdatedAggregator(getCurrencyAggregator(currency), event);
  return fetchLatestAnswer(aggregator);
}
