import { ethereum, Address, BigDecimal } from '@graphprotocol/graph-ts';
import { ONE_BD, ZERO_BD } from '@enzymefinance/subgraph-utils';
import { PrimitiveRegistration, CurrencyRegistration, DerivativeRegistration, Asset } from '../../generated/schema';
import { getOrCreateAsset } from '../entities/Asset';
import { getOrCreateCurrency } from '../entities/Currency';
import { getLatestAssetPrice, updateAssetPrice } from '../entities/AssetPrice';
import {
  getLatestCurrencyValueInEth,
  getLatestCurrencyValueInUsd,
  updateCurrencyValue,
} from '../entities/CurrencyValue';
import { toEth } from './toEth';
import { fetchAssetPrice } from './fetchAssetPrice';
import { Registration } from '../entities/Registration';

export function updateForCurrencyRegistration(
  registration: CurrencyRegistration,
  event: ethereum.Event,
  value: BigDecimal,
): void {
  let currency = getOrCreateCurrency(registration.currency);
  if (currency.id == 'USD') {
    updateCurrencyValue(currency, value, ONE_BD, event).eth;

    let btc = getOrCreateCurrency('BTC');
    let btcUsd = getLatestCurrencyValueInUsd(btc);
    updateCurrencyValue(btc, toEth(btcUsd, value), btcUsd, event);

    let eur = getOrCreateCurrency('EUR');
    let eurUsd = getLatestCurrencyValueInUsd(eur);
    updateCurrencyValue(eur, toEth(eurUsd, value), eurUsd, event);

    let aud = getOrCreateCurrency('AUD');
    let audUsd = getLatestCurrencyValueInUsd(aud);
    updateCurrencyValue(aud, toEth(audUsd, value), audUsd, event);

    let chf = getOrCreateCurrency('CHF');
    let chfUsd = getLatestCurrencyValueInUsd(chf);
    updateCurrencyValue(chf, toEth(chfUsd, value), chfUsd, event);

    let gbp = getOrCreateCurrency('GBP');
    let gbpUsd = getLatestCurrencyValueInUsd(gbp);
    updateCurrencyValue(gbp, toEth(gbpUsd, value), gbpUsd, event);

    let jpy = getOrCreateCurrency('JPY');
    let jpyUsd = getLatestCurrencyValueInUsd(jpy);
    updateCurrencyValue(jpy, toEth(jpyUsd, value), jpyUsd, event);
  } else {
    let usd = getOrCreateCurrency('USD');
    let usdEth = getLatestCurrencyValueInEth(usd);
    updateCurrencyValue(currency, toEth(value, usdEth), value, event);
  }
}

export function updateForPrimitiveRegistration(
  registration: PrimitiveRegistration,
  event: ethereum.Event,
  value: BigDecimal | null = null,
): void {
  let asset = getOrCreateAsset(Address.fromString(registration.asset));
  // Skip the update if the given registration is not the active registration for this asset.
  if (!isActiveRegistration(registration as Registration, asset)) {
    return;
  }

  if (value == null) {
    updateAssetPriceWithValueInterpreter(asset, Address.fromString(registration.interpreter), event);
  } else {
    updateAssetPrice(asset, value as BigDecimal, event);
  }
}

export function updateForDerivativeRegistration(registration: DerivativeRegistration, event: ethereum.Event): void {
  let asset = getOrCreateAsset(Address.fromString(registration.asset));
  // Skip the update if the given registration is not the active registration for this asset.
  if (!isActiveRegistration(registration as Registration, asset)) {
    return;
  }

  updateAssetPriceWithValueInterpreter(asset, Address.fromString(registration.interpreter), event);
}

function isActiveRegistration(registration: Registration, asset: Asset): boolean {
  let registrations = asset.registrations;
  if (registrations.length == 0) {
    return false;
  }

  return registrations[0] == registration.id;
}

function updateAssetPriceWithValueInterpreter(asset: Asset, interpreter: Address, event: ethereum.Event): void {
  // Skip the update if there has already been a non-zero update for this asset in this block.
  let latest = getLatestAssetPrice(asset);
  if (latest != null && latest.block.equals(event.block.number) && !latest.price.equals(ZERO_BD)) {
    return;
  }

  let value = fetchAssetPrice(asset, interpreter);
  updateAssetPrice(asset, value, event);
}
