import { Address } from '@graphprotocol/graph-ts';
import {
  DerivativeAdded,
  DerivativeRemoved,
} from '../generated/AggregatedDerivativePriceFeedContract';
import { createDerivativeRegistration, removeDerivativeRegistration } from './entities/Registration';
import { initializeCurrencies } from './utils/initializeCurrencies';
import { updateForDerivativeRegistration } from './utils/updateForRegistration';

{{#each releases}}
// RELEASE START {{nameSuffix}}

export function handleDerivativeAdded{{nameSuffix}}(event: DerivativeAdded): void {
  let valueInterpreter = Address.fromString('{{valueInterpreter}}');
  let registrationPriority = {{registrationPriority}};

  initializeCurrencies(event);
  createDerivativeRegistration(event.params.derivative, event.address, valueInterpreter, registrationPriority);

  let registration = createDerivativeRegistration(event.params.derivative, event.address, valueInterpreter, registrationPriority);
  updateForDerivativeRegistration(registration, event);
}

export function handleDerivativeRemoved{{nameSuffix}}(event: DerivativeRemoved): void {
  initializeCurrencies(event);
  removeDerivativeRegistration(event.params.derivative, event.address);
}

// RELEASE END {{nameSuffix}}
{{/each}}
