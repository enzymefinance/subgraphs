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
  createCurrency('USD', usdEth, ONE_BD);

  let btcUsd = fetchLatestCurrencyAggregatorAnswer('BTC', event);
  createCurrency('BTC', saveDivideBigDecimal(btcUsd, usdEth), btcUsd);

  let eurUsd = fetchLatestCurrencyAggregatorAnswer('EUR', event);
  createCurrency('EUR', saveDivideBigDecimal(eurUsd, usdEth), eurUsd);

  let audUsd = fetchLatestCurrencyAggregatorAnswer('AUD', event);
  createCurrency('AUD', saveDivideBigDecimal(audUsd, usdEth), audUsd);

  let chfUsd = fetchLatestCurrencyAggregatorAnswer('CHF', event);
  createCurrency('CHF', saveDivideBigDecimal(chfUsd, usdEth), chfUsd);

  let gbpUsd = fetchLatestCurrencyAggregatorAnswer('GBP', event);
  createCurrency('GBP', saveDivideBigDecimal(gbpUsd, usdEth), gbpUsd);

  let jpyUsd = fetchLatestCurrencyAggregatorAnswer('JPY', event);
  createCurrency('JPY', saveDivideBigDecimal(jpyUsd, usdEth), jpyUsd);
}

function createCurrency(id: string, eth: BigDecimal, usd: BigDecimal): void {
  let currency = new Currency(id);
  currency.usd = usd;
  currency.eth = eth;
  currency.save();
}

function fetchLatestCurrencyAggregatorAnswer(currency: string, event: ethereum.Event): BigDecimal {
  let aggregator = getUpdatedAggregator(getCurrencyAggregator(currency), event);
  return fetchLatestAnswer(aggregator);
}
