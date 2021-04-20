import { Currency } from '../generated/schema';

export function ensureCurrency(id: string): Currency {
  let currency = Currency.load(id) as Currency;
  if (currency) {
    return currency;
  }

  currency = new Currency(id);
  currency.save();

  return currency;
}
