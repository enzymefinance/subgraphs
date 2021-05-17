import { ZERO_BD } from '@enzymefinance/subgraph-utils';
import { Currency } from '../../generated/schema';
import { fetchLatestAnswer } from '../utils/fetchLatestAnswer';
import { getCurrencyAggregator } from '../utils/getCurrencyAggregator';
import { createCurrencyRegistration } from './Registration';

export function getOrCreateCurrency(): Currency {
  let currency = Currency.load('CURRENCY') as Currency;

  if (currency == null) {
    let usdAggregator = createCurrencyRegistration('USD', getCurrencyAggregator('USD'));
    let btcAggregator = createCurrencyRegistration('BTC', getCurrencyAggregator('BTC'));
    let eurAggregator = createCurrencyRegistration('EUR', getCurrencyAggregator('EUR'));
    let audAggregator = createCurrencyRegistration('AUD', getCurrencyAggregator('AUD'));
    let chfAggregator = createCurrencyRegistration('CHF', getCurrencyAggregator('CHF'));
    let gbpAggregator = createCurrencyRegistration('GBP', getCurrencyAggregator('GBP'));
    let jpyAggregator = createCurrencyRegistration('JPY', getCurrencyAggregator('JPY'));

    let usd = fetchLatestAnswer(usdAggregator);
    let btc = fetchLatestAnswer(btcAggregator);
    let eur = fetchLatestAnswer(eurAggregator);
    let aud = fetchLatestAnswer(audAggregator);
    let chf = fetchLatestAnswer(chfAggregator);
    let gbp = fetchLatestAnswer(gbpAggregator);
    let jpy = fetchLatestAnswer(jpyAggregator);

    currency = new Currency('CURRENCY');
    currency.usd = usd.equals(ZERO_BD) ? ZERO_BD : usd;
    currency.btc = btc.equals(ZERO_BD) ? ZERO_BD : usd.div(btc);
    currency.eur = eur.equals(ZERO_BD) ? ZERO_BD : usd.div(eur);
    currency.aud = aud.equals(ZERO_BD) ? ZERO_BD : usd.div(aud);
    currency.chf = chf.equals(ZERO_BD) ? ZERO_BD : usd.div(chf);
    currency.gbp = gbp.equals(ZERO_BD) ? ZERO_BD : usd.div(gbp);
    currency.jpy = jpy.equals(ZERO_BD) ? ZERO_BD : usd.div(jpy);
    currency.save();
  }

  return currency;
}
