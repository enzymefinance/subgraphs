import { BigDecimal, ethereum } from '@graphprotocol/graph-ts';
import { ONE_BD } from '@enzymefinance/subgraph-utils';
import { Currency } from '../../generated/schema';
import { getOrCreateAggregator } from '../entities/Aggregator';
import { getOrCreateCurrency } from '../entities/Currency';
import { updateCurrencyValue } from '../entities/CurrencyValue';
import { createCurrencyRegistration } from '../entities/Registration';
import { fetchLatestAnswer } from './fetchLatestAnswer';
import { getCurrencyAggregator } from './getCurrencyAggregator';
import { toEth } from './toEth';

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

  // Note: We must initialize USD first because the other currencies are quoted against USD.
  let usd = getOrCreateCurrency('USD');
  let usdEth = fetchLatestCurrencyValue(usd);
  updateCurrencyValue(usd, usdEth, ONE_BD, event);

  let btc = getOrCreateCurrency('BTC');
  let btcUsd = fetchLatestCurrencyValue(btc);
  updateCurrencyValue(btc, toEth(btcUsd, usdEth), btcUsd, event);

  let eur = getOrCreateCurrency('EUR');
  let eurUsd = fetchLatestCurrencyValue(eur);
  updateCurrencyValue(eur, toEth(eurUsd, usdEth), eurUsd, event);

  let aud = getOrCreateCurrency('AUD');
  let audUsd = fetchLatestCurrencyValue(aud);
  updateCurrencyValue(aud, toEth(audUsd, usdEth), audUsd, event);

  let chf = getOrCreateCurrency('CHF');
  let chfUsd = fetchLatestCurrencyValue(chf);
  updateCurrencyValue(chf, toEth(chfUsd, usdEth), chfUsd, event);

  let gbp = getOrCreateCurrency('GBP');
  let gbpUsd = fetchLatestCurrencyValue(gbp);
  updateCurrencyValue(gbp, toEth(gbpUsd, usdEth), gbpUsd, event);

  let jpy = getOrCreateCurrency('JPY');
  let jpyUsd = fetchLatestCurrencyValue(jpy);
  updateCurrencyValue(jpy, toEth(jpyUsd, usdEth), jpyUsd, event);
}

function fetchLatestCurrencyValue(currency: Currency): BigDecimal {
  let aggregator = getOrCreateAggregator(getCurrencyAggregator(currency.id));
  return fetchLatestAnswer(aggregator);
}
