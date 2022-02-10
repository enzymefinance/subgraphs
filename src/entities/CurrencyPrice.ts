import { BigDecimal, BigInt } from '@graphprotocol/graph-ts';
import { Currency, CurrencyPrice } from '../generated/schema';
import { logCritical } from '../utils/logCritical';

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

  currency.price = current.id;
  currency.save();

  return current;
}
