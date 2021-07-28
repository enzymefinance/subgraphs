import { BigDecimal, ethereum } from '@graphprotocol/graph-ts';
import { Currency } from '../../generated/schema';
import { getOrCreateAggregator } from '../entities/Aggregator';
import { getOrCreateCurrency } from '../entities/Currency';
import { updateCurrencyValue } from '../entities/CurrencyValue';
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

  // Note: We must initialize USD first because the other currencies are quoted against USD.
  let usd = getOrCreateCurrency('USD');
  updateCurrencyValue(usd, fetchLatestCurrencyValue(usd), event);

  let btc = getOrCreateCurrency('BTC');
  updateCurrencyValue(btc, fetchLatestCurrencyValue(btc), event);

  let eur = getOrCreateCurrency('EUR');
  updateCurrencyValue(eur, fetchLatestCurrencyValue(eur), event);

  let aud = getOrCreateCurrency('AUD');
  updateCurrencyValue(aud, fetchLatestCurrencyValue(aud), event);

  let chf = getOrCreateCurrency('CHF');
  updateCurrencyValue(chf, fetchLatestCurrencyValue(chf), event);

  let gbp = getOrCreateCurrency('GBP');
  updateCurrencyValue(gbp, fetchLatestCurrencyValue(gbp), event);

  let jpy = getOrCreateCurrency('JPY');
  updateCurrencyValue(jpy, fetchLatestCurrencyValue(jpy), event);
}

function fetchLatestCurrencyValue(currency: Currency): BigDecimal {
  let aggregator = getOrCreateAggregator(getCurrencyAggregator(currency.id));
  return fetchLatestAnswer(aggregator);
}
