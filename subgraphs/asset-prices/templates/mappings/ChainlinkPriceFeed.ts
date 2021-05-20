import { Address } from '@graphprotocol/graph-ts';
import { PrimitiveAdded, PrimitiveUpdated, PrimitiveRemoved } from '../generated/ChainlinkPriceFeedContract';
import { createOrUpdatePrimitiveRegistration, removePrimitiveRegistration } from './entities/Registration';
import { initializeCurrencies } from './utils/initializeCurrencies';
import { updateForPrimitiveRegistration } from './utils/updateForRegistration';

{{#each releases}}
// RELEASE START {{nameSuffix}}

export function handlePrimitiveAdded{{nameSuffix}}(event: PrimitiveAdded): void {
  initializeCurrencies(event);

  let valueInterpreter = Address.fromString('{{valueInterpreter}}');
  let registrationPriority = {{registrationPriority}};
  let registration = createOrUpdatePrimitiveRegistration(event.params.primitive, event.address, event.params.aggregator, valueInterpreter, registrationPriority);
  updateForPrimitiveRegistration(registration, event);
}

export function handlePrimitiveUpdated{{nameSuffix}}(event: PrimitiveUpdated): void {
  initializeCurrencies(event);

  let valueInterpreter = Address.fromString('{{valueInterpreter}}');
  let registrationPriority = {{registrationPriority}};
  let registration = createOrUpdatePrimitiveRegistration(event.params.primitive, event.address, event.params.nextAggregator, valueInterpreter, registrationPriority);
  updateForPrimitiveRegistration(registration, event);
}

export function handlePrimitiveRemoved{{nameSuffix}}(event: PrimitiveRemoved): void {
  initializeCurrencies(event);
  removePrimitiveRegistration(event.params.primitive, event.address);
}

// RELEASE END {{nameSuffix}}
{{/each}}
