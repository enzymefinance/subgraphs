import { ONE_BD, saveDivideBigDecimal } from '@enzymefinance/subgraph-utils';
import { BigDecimal, ethereum, log } from '@graphprotocol/graph-ts';
import { Currency } from '../generated/schema';
import { initializeCurrencies } from '../utils/initializeCurrencies';
import { getAsset, updateAssetPriceWithValueInterpreter } from './Asset';
import { getActiveRegistration } from './Registration';
import { getOrCreateUsdQuotedPrimitiveRegistry } from './UsdQuotedPrimitiveRegistry';

export function getOrCreateCurrency(id: string, event: ethereum.Event): Currency {
  let currency = Currency.load(id);
  if (currency == null) {
    initializeCurrencies(event);
  }

  currency = Currency.load(id);
  if (currency == null) {
    log.critical('Failed to load currency {}', [id]);
  }

  return currency as Currency;
}

function doUpdateCurrency(currency: Currency, eth: BigDecimal, usd: BigDecimal, event: ethereum.Event): void {
  currency.updated = event.block.number.toI32();
  currency.usd = usd;
  currency.eth = eth;
  currency.save();
}

export function updateCurrency(currency: Currency, value: BigDecimal, event: ethereum.Event): void {
  if (currency.id == 'USD') {
    doUpdateCurrency(currency, saveDivideBigDecimal(ONE_BD, value), ONE_BD, event);

    let btc = getOrCreateCurrency('BTC', event);
    doUpdateCurrency(btc, saveDivideBigDecimal(btc.usd, value), btc.usd, event);
    let eur = getOrCreateCurrency('EUR', event);
    doUpdateCurrency(eur, saveDivideBigDecimal(eur.usd, value), eur.usd, event);
    let aud = getOrCreateCurrency('AUD', event);
    doUpdateCurrency(aud, saveDivideBigDecimal(aud.usd, value), aud.usd, event);
    let chf = getOrCreateCurrency('CHF', event);
    doUpdateCurrency(chf, saveDivideBigDecimal(chf.usd, value), chf.usd, event);
    let gbp = getOrCreateCurrency('GBP', event);
    doUpdateCurrency(gbp, saveDivideBigDecimal(gbp.usd, value), gbp.usd, event);
    let jpy = getOrCreateCurrency('JPY', event);
    doUpdateCurrency(jpy, saveDivideBigDecimal(jpy.usd, value), jpy.usd, event);

    let registry = getOrCreateUsdQuotedPrimitiveRegistry();
    let primitives = registry.assets;
    for (let i: i32 = 0; i < primitives.length; i++) {
      let asset = getAsset(primitives[i]);
      let registration = getActiveRegistration(asset);
      if (registration == null) {
        continue;
      }

      updateAssetPriceWithValueInterpreter(asset, registration.version, event);
    }
  } else {
    let usd = getOrCreateCurrency('USD', event);
    doUpdateCurrency(currency, saveDivideBigDecimal(usd.eth, value), value, event);
  }
}
