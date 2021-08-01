import { arrayUnique, saveDivideBigDecimal, toBigDecimal } from '@enzymefinance/subgraph-utils';
import { Address } from '@graphprotocol/graph-ts';
import { AnswerUpdated } from '../generated/AggregatorInterfaceContract';
import { AggregatorProxy, CurrencyRegistration, PrimitiveRegistration } from '../generated/schema';
import { getOrCreateAsset } from '../entities/Asset';
import { updateAssetPrice } from '../entities/AssetPrice';
import { getOrCreateCurrency } from '../entities/Currency';
import { getLatestCurrencyValueInEth } from '../entities/CurrencyValue';
import { getUpdatedAggregator, Registration } from '../entities/Registration';
import { updateDerivativePrices } from '../entities/Updater';
import { updateForCurrencyRegistration } from '../utils/updateForRegistration';

export function handleAnswerUpdated(event: AnswerUpdated): void {
  let aggregator = getUpdatedAggregator(event.address, event);
  let proxies: Array<AggregatorProxy> = aggregator.proxies
    .map<AggregatorProxy>((id) => AggregatorProxy.load(id) as AggregatorProxy)
    .filter((item) => item != null);

  let ids = new Array<string>();
  for (let i: i32 = 0; i < proxies.length; i++) {
    let proxy = proxies[i];
    ids = ids.concat(proxy.registrations);
  }

  let registrations: Array<Registration> = arrayUnique<string>(ids)
    .map<Registration>((id) => Registration.load(id) as Registration)
    .filter((registration) => registration != null);

  if (registrations.length == 0) {
    return;
  }

  // Always update all currency registrations.
  let currencies: Array<CurrencyRegistration> = registrations
    .filter((registration) => registration.type == 'CURRENCY')
    .map<CurrencyRegistration>((registration) => registration as CurrencyRegistration);

  let value = toBigDecimal(event.params.current, aggregator.decimals);
  for (let i: i32 = 0; i < currencies.length; i++) {
    let currency = currencies[i];
    updateForCurrencyRegistration(currency, event, value);
  }

  // Only run updates for assets where the triggered registration is the highest priority.
  let primitives = registrations
    .filter((registration) => registration.type == 'PRIMITIVE')
    .map<PrimitiveRegistration>((registration) => registration as PrimitiveRegistration)
    .filter((registration) => {
      let asset = getOrCreateAsset(Address.fromString(registration.asset));
      let registrations = asset.registrations;
      return registrations.length > 0 && registrations[0] == registration.id;
    });

  // Aggregators with 8 decimals are USD based by convention.
  if (aggregator.decimals == 8) {
    let usd = getOrCreateCurrency('USD');
    value = saveDivideBigDecimal(value, getLatestCurrencyValueInEth(usd));
  }

  for (let i: i32 = 0; i < primitives.length; i++) {
    let registration = primitives[i];
    let asset = getOrCreateAsset(Address.fromString(registration.asset));
    updateAssetPrice(asset, value, event);
  }

  // Trigger the derivative update side-effect on every chainlink aggregator update.
  updateDerivativePrices(event);
}
