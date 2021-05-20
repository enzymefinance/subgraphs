import { arrayUnique } from '@enzymefinance/subgraph-utils';
import { Address } from '@graphprotocol/graph-ts';
import { AnswerUpdated } from '../generated/AggregatorInterfaceContract';
import { AggregatorProxy, CurrencyRegistration, PrimitiveRegistration } from '../generated/schema';
import { getOrCreateAsset } from './entities/Asset';
import { getUpdatedAggregator, Registration } from './entities/Registration';
import { updateDerivativePrices } from './entities/Updater';
import { updateForCurrencyRegistration, updateForPrimitiveRegistration } from './utils/updateForRegistration';

export function handleAnswerUpdated(event: AnswerUpdated): void {
  let aggregator = getUpdatedAggregator(event.address);
  if (aggregator.proxies.length == 0) {
    return;
  }

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

  // Always update all currency registrations.
  let currencies = registrations
    .filter((registration) => registration.type == 'CURRENCY')
    .map<CurrencyRegistration>((registration) => registration as CurrencyRegistration);

  for (let i: i32 = 0; i < currencies.length; i++) {
    updateForCurrencyRegistration(currencies[i], event);
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

  for (let i: i32 = 0; i < primitives.length; i++) {
    updateForPrimitiveRegistration(primitives[i], event);
  }

  // Trigger the derivative update side-effect on every chainlink aggregator update.
  updateDerivativePrices(event);
}
