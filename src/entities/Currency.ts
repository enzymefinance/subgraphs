import { Currency } from '../generated/schema';
import { logCritical } from '../utils/logCritical';

export function useCurrency(id: string): Currency {
  let currency = Currency.load(id) as Currency;
  if (currency == null) {
    logCritical('Failed to load currency {}.', [id]);
  }

  return currency;
}

export function ensureCurrency(id: string): Currency {
  let currency = Currency.load(id) as Currency;
  if (currency) {
    return currency;
  }

  currency = new Currency(id);
  currency.save();

  return currency;
}
