import { Address, BigDecimal, ethereum } from '@graphprotocol/graph-ts';
import { ONE_BD, saveDivideBigDecimal, uniqueSortableEventId, ZERO_BD } from '@enzymefinance/subgraph-utils';
import { Currency, CurrencyValue, PrimitiveRegistration } from '../../generated/schema';
import { getOrCreateCurrency } from './Currency';
import { getOrCreateUsdQuotedPrimitiveRegistry } from './UsdQuotedPrimitiveRegistry';
import { getOrCreateAsset } from './Asset';
import { updateAssetPriceWithValueInterpreter } from './AssetPrice';
import { getActiveRegistration } from './Registration';

function currencyValueId(currency: Currency, event: ethereum.Event): string {
  return currency.id + '/' + event.block.number.toString();
}

export function updateCurrencyValue(currency: Currency, value: BigDecimal, event: ethereum.Event): CurrencyValue {
  let id = currencyValueId(currency, event);
  let entity = new CurrencyValue(id);
  let eth =
    currency.id == 'USD' ? value : saveDivideBigDecimal(getLatestCurrencyValueInEth(getOrCreateCurrency('USD')), value);
  let usd = currency.id == 'USD' ? ONE_BD : value;

  entity.incremental = uniqueSortableEventId(event);
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

  if (currency.id == 'USD') {
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
      let registration = getActiveRegistration(asset) as PrimitiveRegistration;
      updateAssetPriceWithValueInterpreter(asset, Address.fromString(registration.interpreter), event);
    }
  }

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
