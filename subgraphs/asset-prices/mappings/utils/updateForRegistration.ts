import { ethereum, Address, BigDecimal } from '@graphprotocol/graph-ts';
import { ONE_BD, ZERO_BD } from '@enzymefinance/subgraph-utils';
import { PrimitiveRegistration, DerivativeRegistration, CurrencyRegistration } from '../../generated/schema';
import { getOrCreateAsset } from '../entities/Asset';
import { getOrCreateCurrency } from '../entities/Currency';
import { updatePrice } from '../entities/Price';
import { Registration } from '../entities/Registration';

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
    currency.btc = currency.btc.equals(ZERO_BD) ? ZERO_BD : value.div(ONE_BD.div(currency.btc).times(before));
    currency.eur = currency.eur.equals(ZERO_BD) ? ZERO_BD : value.div(ONE_BD.div(currency.eur).times(before));
    currency.aud = currency.aud.equals(ZERO_BD) ? ZERO_BD : value.div(ONE_BD.div(currency.aud).times(before));
    currency.chf = currency.chf.equals(ZERO_BD) ? ZERO_BD : value.div(ONE_BD.div(currency.chf).times(before));
    currency.gbp = currency.gbp.equals(ZERO_BD) ? ZERO_BD : value.div(ONE_BD.div(currency.gbp).times(before));
    currency.jpy = currency.jpy.equals(ZERO_BD) ? ZERO_BD : value.div(ONE_BD.div(currency.jpy).times(before));
  } else {
    let updated = value.equals(ZERO_BD) ? ZERO_BD : currency.usd.div(value);

    if (registration.currency == 'BTC') {
      currency.btc = updated;
    } else if (registration.currency == 'EUR') {
      currency.eur = updated;
    } else if (registration.currency == 'AUD') {
      currency.aud = updated;
    } else if (registration.currency == 'CHF') {
      currency.chf = updated;
    } else if (registration.currency == 'GBP') {
      currency.gbp = updated;
    } else if (registration.currency == 'JPY') {
      currency.jpy = updated;
    }
  }

  currency.save();
}
