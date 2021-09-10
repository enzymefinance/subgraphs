import { arrayUnique, saveDivideBigDecimal, toBigDecimal } from '@enzymefinance/subgraph-utils';
import { AnswerUpdated } from '../generated/AggregatorInterfaceContract';
import { AggregatorProxy, CurrencyRegistration, PrimitiveRegistration } from '../generated/schema';
import { getAsset, updateAssetPrice } from '../entities/Asset';
import { getOrCreateCurrency } from '../entities/Currency';
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
  let currencyRegistrations: Array<CurrencyRegistration> = registrations
    .filter((registration) => registration.type == 'CURRENCY')
    .map<CurrencyRegistration>((registration) => registration as CurrencyRegistration);

  let value = toBigDecimal(event.params.current, aggregator.decimals);
  for (let i: i32 = 0; i < currencyRegistrations.length; i++) {
    let currency = currencyRegistrations[i];
    updateForCurrencyRegistration(currency, event, value);
  }

  // Only run updates for assets where the triggered registration is the highest priority.
  let primitiveRegistrations = registrations
    .filter((registration) => registration.type == 'PRIMITIVE')
    .map<PrimitiveRegistration>((registration) => registration as PrimitiveRegistration)
    .filter((registration) => {
      let asset = getAsset(registration.asset);
      let registrations = asset.registrations;
      return registrations.length > 0 && registrations[0] == registration.id;
    });

  // Aggregators with 8 decimals are USD based by convention.
  if (aggregator.decimals == 8) {
    let usd = getOrCreateCurrency('USD', event);
    value = saveDivideBigDecimal(value, usd.eth);
  }

  for (let i: i32 = 0; i < primitiveRegistrations.length; i++) {
    let registration = primitiveRegistrations[i];
    let asset = getAsset(registration.asset);
    updateAssetPrice(asset, value, event);
  }

  // Trigger the derivative update side-effect on every chainlink aggregator update.
  updateDerivativePrices(event);
}
