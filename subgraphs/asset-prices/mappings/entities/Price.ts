import { ZERO_BD } from '@enzymefinance/subgraph-utils';
import { BigDecimal, ethereum } from '@graphprotocol/graph-ts';
import {
  Asset,
  CurrencyRegistration,
  DerivativeRegistration,
  Price,
  PrimitiveRegistration,
} from '../../generated/schema';
import { getOrCreateCurrency } from './Currency';
import { updateDailyPriceWindow, updateHourlyPriceWindow, updateMonthlyPriceWindow } from './PriceWindow';
import { Registration } from './Registration';

function assetPriceId(asset: Asset, block: ethereum.Block): string {
  return asset.id + '/' + block.number.toString();
}

export function updatePrice(asset: Asset, price: BigDecimal, block: ethereum.Block): Price {
  let id = assetPriceId(asset, block);
  let entity = Price.load(id) as Price;

  // Skip updates if the price hasn't changed.
  if (entity != null && price.equals(entity.eth)) {
    return entity;
  }

  // If the price is zero, keep the previous price if it's for the same block.
  if (entity != null && price.equals(ZERO_BD) && entity.block.equals(block.number)) {
    return entity;
  }

  let currencies = getOrCreateCurrency();
  entity = new Price(id);
  entity.asset = asset.id;
  entity.block = block.number;
  entity.timestamp = block.timestamp;
  entity.eth = price;
  entity.btc = price.times(currencies.btc);
  entity.usd = price.times(currencies.usd);
  entity.eur = price.times(currencies.eur);
  entity.aud = price.times(currencies.aud);
  entity.chf = price.times(currencies.chf);
  entity.gbp = price.times(currencies.gbp);
  entity.jpy = price.times(currencies.jpy);
  entity.save();

  let hourly = updateHourlyPriceWindow(asset, entity);
  let daily = updateDailyPriceWindow(asset, entity);
  let monthly = updateMonthlyPriceWindow(asset, entity);

  // NOTE: It's important that we update the price references AFTER the candles have been updated.
  // Otherwise, we can't carry over the previous value to the new candles.
  asset.price = entity.id;
  asset.hourly = hourly.id;
  asset.daily = daily.id;
  asset.monthly = monthly.id;
  asset.save();

  return entity;
}

export function updateForRegistration(registration: Registration, value: BigDecimal, block: ethereum.Block): void {
  if (registration.type == 'PRIMITIVE') {
    updateForPrimitiveRegistration(registration as PrimitiveRegistration, value, block);
  } else if (registration.type == 'DERIVATIVE') {
    updateForDerivativeRegistration(registration as DerivativeRegistration, value, block);
  } else if (registration.type == 'CURRENCY') {
    updateForCurrencyRegistration(registration as CurrencyRegistration, value);
  }
}

function updateForPrimitiveRegistration(
  registration: PrimitiveRegistration,
  value: BigDecimal,
  block: ethereum.Block,
): void {
  let asset = getOrCreateAsset(Address.fromString(registration.asset));
  updatePrice(asset, value, block);
}

function updateForDerivativeRegistration(
  registration: DerivativeRegistration,
  value: BigDecimal,
  block: ethereum.Block,
): void {
  // TODO
}

function updateForCurrencyRegistration(registration: CurrencyRegistration, value: BigDecimal): void {
  let currency = getOrCreateCurrency();

  if (registration.currency == 'USD') {
    let before = currency.usd;
    currency.usd = value;
    currency.btc = value.div(ONE_BD.div(currency.btc).times(before));
    currency.eur = value.div(ONE_BD.div(currency.eur).times(before));
    currency.aud = value.div(ONE_BD.div(currency.aud).times(before));
    currency.chf = value.div(ONE_BD.div(currency.chf).times(before));
    currency.gbp = value.div(ONE_BD.div(currency.gbp).times(before));
    currency.jpy = value.div(ONE_BD.div(currency.jpy).times(before));
  } else if (registration.currency == 'BTC') {
    currency.btc = currency.usd.div(value);
  } else if (registration.currency == 'EUR') {
    currency.eur = currency.usd.div(value);
  } else if (registration.currency == 'AUD') {
    currency.aud = currency.usd.div(value);
  } else if (registration.currency == 'CHF') {
    currency.chf = currency.usd.div(value);
  } else if (registration.currency == 'GBP') {
    currency.gbp = currency.usd.div(value);
  } else if (registration.currency == 'JPY') {
    currency.jpy = currency.usd.div(value);
  }

  currency.save();
}
