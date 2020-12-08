import { BigInt } from '@graphprotocol/graph-ts';
import { Currency, CurrencyPrice, DailyCurrencyPriceCandle, HourlyCurrencyPriceCandle } from '../generated/schema';
import {
  getDayCloseTime,
  getDayOpenTime,
  getHourCloseTime,
  getHourOpenTime,
  getMonthOpenAndClose,
} from '../utils/timeHelpers';
import { useCurrencyPrice } from './CurrencyPrice';
import { CurrencyPriceCandle } from './CurrencyPriceCandleEntity';

export function currencyPriceCandleId(currencyId: string, type: string, open: BigInt): string {
  return currencyId + '/' + type + '/' + open.toString();
}

export function updateHourlyCurrencyPriceCandle(currency: Currency, current: CurrencyPrice): HourlyCurrencyPriceCandle {
  let type = 'Hourly';
  let from = getHourOpenTime(current.timestamp);
  let to = getHourCloseTime(current.timestamp);
  return maintainCurrencyPriceCandle(type, from, to, currency, current) as HourlyCurrencyPriceCandle;
}

export function updateDailyCurrencyPriceCandle(currency: Currency, current: CurrencyPrice): DailyCurrencyPriceCandle {
  let type = 'Daily';
  let from = getDayOpenTime(current.timestamp);
  let to = getDayCloseTime(current.timestamp);
  return maintainCurrencyPriceCandle(type, from, to, currency, current) as DailyCurrencyPriceCandle;
}

export function updateMonthlyCurrencyPriceCandle(currency: Currency, current: CurrencyPrice): DailyCurrencyPriceCandle {
  let type = 'Monthly';
  let openAndClose = getMonthOpenAndClose(current.timestamp);
  return maintainCurrencyPriceCandle(
    type,
    openAndClose[0],
    openAndClose[1],
    currency,
    current,
  ) as DailyCurrencyPriceCandle;
}

export function maintainCurrencyPriceCandle(
  type: string,
  from: BigInt,
  to: BigInt,
  currency: Currency,
  current: CurrencyPrice,
): CurrencyPriceCandle {
  let id = currencyPriceCandleId(current.currency, type, from);
  let candle = CurrencyPriceCandle.load(type, id) as CurrencyPriceCandle;
  if (!candle) {
    return createCurrencyPriceCandle(id, type, currency, current, from, to);
  }

  return updateCurrencyPriceCandle(type, candle, current);
}

function createCurrencyPriceCandle(
  id: string,
  type: string,
  currency: Currency,
  current: CurrencyPrice,
  from: BigInt,
  to: BigInt,
): CurrencyPriceCandle {
  let previous = currency.price == null || currency.price == current.id ? current : useCurrencyPrice(currency.price);
  let high = previous.price.gt(current.price) ? previous : current;
  let low = previous.price.lt(current.price) ? previous : current;

  let candle = new CurrencyPriceCandle(id);
  candle.currency = current.currency;
  candle.group = from.toString();
  candle.from = from;
  candle.to = to;
  candle.open = previous.price;
  candle.openRef = previous.id;
  candle.close = current.price;
  candle.closeRef = current.id;
  candle.high = high.price;
  candle.highRef = high.id;
  candle.low = low.price;
  candle.lowRef = low.id;
  candle.save(type);

  return candle;
}

function updateCurrencyPriceCandle(
  type: string,
  candle: CurrencyPriceCandle,
  current: CurrencyPrice,
): CurrencyPriceCandle {
  if (candle.closeRef == current.id) {
    return candle;
  }

  candle.close = current.price;
  candle.closeRef = current.id;

  if (current.price.lt(candle.low)) {
    candle.low = current.price;
    candle.lowRef = current.id;
  }

  if (current.price.gt(candle.high)) {
    candle.high = current.price;
    candle.highRef = current.id;
  }

  candle.save(type);

  return candle;
}
