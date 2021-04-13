import { BigDecimal, BigInt } from '@graphprotocol/graph-ts';
import { Currency, CurrencyPrice } from '../generated/schema';
import { ensureCron } from '../utils/cronManager';
import { logCritical } from '../utils/logCritical';
import { ensureCurrency } from './Currency';
import {
  updateDailyCurrencyPriceCandle,
  updateHourlyCurrencyPriceCandle,
  updateMonthlyCurrencyPriceCandle,
} from './CurrencyPriceCandle';

export function currencyPriceId(currency: Currency, timestamp: BigInt): string {
  return currency.id + '/' + timestamp.toString();
}

export function useCurrencyPrice(id: string): CurrencyPrice {
  let price = CurrencyPrice.load(id) as CurrencyPrice;
  if (price == null) {
    logCritical('Currency price {} does not exist', [id]);
  }

  return price;
}

export function createCurrencyPrice(currency: Currency, current: BigDecimal, timestamp: BigInt): CurrencyPrice {
  let id = currencyPriceId(currency, timestamp);
  let price = new CurrencyPrice(id);
  price.currency = currency.id;
  price.price = current;
  price.timestamp = timestamp;
  price.save();

  return price;
}

export function ensureCurrencyPrice(currency: Currency, current: BigDecimal, timestamp: BigInt): CurrencyPrice {
  let id = currencyPriceId(currency, timestamp);
  let price = CurrencyPrice.load(id) as CurrencyPrice;

  if (price != null && !current.equals(price.price)) {
    price.price = current;
    price.save();
  }

  if (price == null) {
    price = createCurrencyPrice(currency, current, timestamp);
  }

  return price;
}

export function trackCurrencyPrice(currency: Currency, timestamp: BigInt, price: BigDecimal): CurrencyPrice {
  let current = ensureCurrencyPrice(currency, price, timestamp);
  let hourly = updateHourlyCurrencyPriceCandle(currency, current);
  let daily = updateDailyCurrencyPriceCandle(currency, current);
  let monthly = updateMonthlyCurrencyPriceCandle(currency, current);

  // NOTE: It's important that we update the price references AFTER the candles have been updated.
  // Otherwise, we can't carry over the previous to the new candles.
  currency.price = current.id;
  currency.hourly = hourly.id;
  currency.daily = daily.id;
  currency.monthly = monthly.id;
  currency.save();

  return current;
}

export function loadCurrentCurrencyPrices(): CurrencyPrice[] {
  let cron = ensureCron();
  let currencies = cron.currencies;

  let prices: CurrencyPrice[] = new Array<CurrencyPrice>();
  for (let i = 0; i < currencies.length; i++) {
    let currency = ensureCurrency(currencies[i]);
    if (currency.price != null) {
      prices = prices.concat([useCurrencyPrice(currency.price)]);
    }
  }

  return prices;
}
