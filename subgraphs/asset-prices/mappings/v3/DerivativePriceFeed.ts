import { Address } from '@graphprotocol/graph-ts';
import { DerivativeAdded, DerivativeRemoved } from '../../generated/DerivativePriceFeedContract';
import { createDerivativeRegistration, removeDerivativeRegistration } from '../../entities/Registration';
import { initializeCurrencies } from '../../utils/initializeCurrencies';
import { updateForDerivativeRegistration } from '../../utils/updateForRegistration';

let registrationPriority = 1;

export function handleDerivativeAdded(event: DerivativeAdded): void {
  let valueInterpreter = Address.fromString('{{valueInterpreter}}');

  initializeCurrencies(event);
  createDerivativeRegistration(event.params.derivative, event.address, valueInterpreter, registrationPriority);

  let registration = createDerivativeRegistration(
    event.params.derivative,
    event.address,
    valueInterpreter,
    registrationPriority,
  );

  updateForDerivativeRegistration(registration, event);
}

export function handleDerivativeRemoved(event: DerivativeRemoved): void {
  initializeCurrencies(event);
  removeDerivativeRegistration(event.params.derivative, event.address);
}
