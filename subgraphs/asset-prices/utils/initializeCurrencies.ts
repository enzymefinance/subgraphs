import { BigDecimal, ethereum } from '@graphprotocol/graph-ts';
import { ONE_BD, saveDivideBigDecimal } from '@enzymefinance/subgraph-utils';
import { Currency } from '../generated/schema';
import { getOrCreateAggregator } from '../entities/Aggregator';
import { createCurrencyRegistration } from '../entities/Registration';
import { fetchLatestAnswer } from './fetchLatestAnswer';
import { getCurrencyAggregator } from './getCurrencyAggregator';

export function initializeCurrencies(event: ethereum.Event): void {
  if (Currency.load('USD') != null) {
    return;
  }

  createCurrencyRegistration('USD');
  createCurrencyRegistration('BTC');
  createCurrencyRegistration('EUR');
  createCurrencyRegistration('AUD');
  createCurrencyRegistration('CHF');
  createCurrencyRegistration('GBP');
  createCurrencyRegistration('JPY');

  let usdEth = fetchLatestCurrencyAggregatorAnswer('USD');
  createCurrency('USD', usdEth, ONE_BD, event);

  let btcUsd = fetchLatestCurrencyAggregatorAnswer('BTC');
  createCurrency('BTC', saveDivideBigDecimal(btcUsd, usdEth), btcUsd, event);

  let eurUsd = fetchLatestCurrencyAggregatorAnswer('EUR');
  createCurrency('EUR', saveDivideBigDecimal(eurUsd, usdEth), eurUsd, event);

  let audUsd = fetchLatestCurrencyAggregatorAnswer('AUD');
  createCurrency('AUD', saveDivideBigDecimal(audUsd, usdEth), audUsd, event);

  let chfUsd = fetchLatestCurrencyAggregatorAnswer('CHF');
  createCurrency('CHF', saveDivideBigDecimal(chfUsd, usdEth), chfUsd, event);

  let gbpUsd = fetchLatestCurrencyAggregatorAnswer('GBP');
  createCurrency('GBP', saveDivideBigDecimal(gbpUsd, usdEth), gbpUsd, event);

  let jpyUsd = fetchLatestCurrencyAggregatorAnswer('JPY');
  createCurrency('JPY', saveDivideBigDecimal(jpyUsd, usdEth), jpyUsd, event);
}

function createCurrency(id: string, eth: BigDecimal, usd: BigDecimal, event: ethereum.Event): void {
  let currency = new Currency(id);
  currency.updated = event.block.timestamp;
  currency.usd = usd;
  currency.eth = eth;
  currency.save();
}

function fetchLatestCurrencyAggregatorAnswer(currency: string): BigDecimal {
  let aggregator = getOrCreateAggregator(getCurrencyAggregator(currency));
  return fetchLatestAnswer(aggregator);
}
