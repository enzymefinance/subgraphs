import { Address, BigDecimal, ethereum } from '@graphprotocol/graph-ts';
import {
  dayCloseTime,
  hourCloseTime,
  monthCloseTime,
  ONE_BD,
  saveDivideBigDecimal,
  ZERO_BD,
} from '@enzymefinance/subgraph-utils';
import {
  Currency,
  CurrencyValue,
  DailyCurrencyValue,
  HourlyCurrencyValue,
  MonthlyCurrencyValue,
  PrimitiveRegistration,
} from '../generated/schema';
import { getOrCreateCurrency } from './Currency';
import { getOrCreateUsdQuotedPrimitiveRegistry } from './UsdQuotedPrimitiveRegistry';
import { getOrCreateAsset } from './Asset';
import { updateAssetPriceWithValueInterpreter } from './AssetPrice';
import { getActiveRegistration } from './Registration';

function currencyValueId(currency: Currency, event: ethereum.Event): string {
  return currency.id + '/' + event.block.number.toString();
}

export function updateCurrencyValue(currency: Currency, value: BigDecimal, event: ethereum.Event): CurrencyValue {
  let isUsd = currency.id == 'USD';

  let id = currencyValueId(currency, event);
  let entity = new CurrencyValue(id);
  let eth = isUsd ? value : saveDivideBigDecimal(getLatestCurrencyValueInEth(getOrCreateCurrency('USD')), value);
  let usd = isUsd ? ONE_BD : value;

  entity.currency = currency.id;
  entity.block = event.block.number;
  entity.timestamp = event.block.timestamp;
  entity.eth = eth;
  entity.usd = usd;
  entity.save();

  if (currency.value != entity.id) {
    currency.value = entity.id;
    currency.save();
  }

  if (isUsd) {
    let btc = getOrCreateCurrency('BTC');
    let btcUsd = getLatestCurrencyValueInUsd(btc);
    updateCurrencyValue(btc, btcUsd, event);

    let eur = getOrCreateCurrency('EUR');
    let eurUsd = getLatestCurrencyValueInUsd(eur);
    updateCurrencyValue(eur, eurUsd, event);

    let aud = getOrCreateCurrency('AUD');
    let audUsd = getLatestCurrencyValueInUsd(aud);
    updateCurrencyValue(aud, audUsd, event);

    let chf = getOrCreateCurrency('CHF');
    let chfUsd = getLatestCurrencyValueInUsd(chf);
    updateCurrencyValue(chf, chfUsd, event);

    let gbp = getOrCreateCurrency('GBP');
    let gbpUsd = getLatestCurrencyValueInUsd(gbp);
    updateCurrencyValue(gbp, gbpUsd, event);

    let jpy = getOrCreateCurrency('JPY');
    let jpyUsd = getLatestCurrencyValueInUsd(jpy);
    updateCurrencyValue(jpy, jpyUsd, event);

    let registry = getOrCreateUsdQuotedPrimitiveRegistry();
    let primitives = registry.assets;
    for (let i: i32 = 0; i < primitives.length; i++) {
      let asset = getOrCreateAsset(Address.fromString(primitives[i]));
      let registration = getActiveRegistration(asset);
      if (registration == null) {
        continue;
      }

      let interpreter = (registration as PrimitiveRegistration).interpreter;
      updateAssetPriceWithValueInterpreter(asset, Address.fromString(interpreter), event);
    }
  }

  let hour = hourCloseTime(event.block.timestamp);
  let hourly = new HourlyCurrencyValue(currency.id + '/hourly/' + hour.toString());
  hourly.currency = entity.currency;
  hourly.block = entity.block;
  hourly.timestamp = entity.timestamp;
  hourly.usd = entity.usd;
  hourly.eth = entity.eth;
  hourly.close = hour;
  hourly.save();

  let day = dayCloseTime(event.block.timestamp);
  let daily = new DailyCurrencyValue(currency.id + '/daily/' + day.toString());
  daily.currency = entity.currency;
  daily.block = entity.block;
  daily.timestamp = entity.timestamp;
  daily.usd = entity.usd;
  daily.eth = entity.eth;
  daily.close = day;
  daily.save();

  let month = monthCloseTime(event.block.timestamp);
  let monthly = new MonthlyCurrencyValue(currency.id + '/monthly/' + month.toString());
  monthly.currency = entity.currency;
  monthly.block = entity.block;
  monthly.timestamp = entity.timestamp;
  monthly.usd = entity.usd;
  monthly.eth = entity.eth;
  monthly.close = month;
  monthly.save();

  return entity;
}

export function getLatestCurrencyValue(currency: Currency): CurrencyValue | null {
  if (currency.value == '') {
    return null;
  }

  return CurrencyValue.load(currency.value);
}

export function getLatestCurrencyValueInEth(currency: Currency): BigDecimal {
  let value = getLatestCurrencyValue(currency);
  return value == null ? ZERO_BD : value.eth;
}

export function getLatestCurrencyValueInUsd(currency: Currency): BigDecimal {
  let value = getLatestCurrencyValue(currency);
  return value == null ? ZERO_BD : value.usd;
}
