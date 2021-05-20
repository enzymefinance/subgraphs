import { Currency } from '../../generated/schema';

export function getOrCreateCurrency(id: string): Currency {
  let currency = Currency.load(id) as Currency;

  if (currency == null) {
    currency = new Currency(id);
    currency.value = '';
    currency.save();
  }

  return currency;
}
