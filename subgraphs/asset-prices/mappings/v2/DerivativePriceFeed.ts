import { DerivativeAdded, DerivativeRemoved } from '../../generated/DerivativePriceFeedContract';
import { createDerivativeRegistration, removeDerivativeRegistration } from '../../entities/Registration';
import { initializeCurrencies } from '../../utils/initializeCurrencies';
import { updateForDerivativeRegistration } from '../../utils/updateForRegistration';
import { valueInterpreterV2Address } from '../../generated/configuration';

let registrationPriority = 1;

export function handleDerivativeAdded(event: DerivativeAdded): void {
  initializeCurrencies(event);
  createDerivativeRegistration(event.params.derivative, event.address, valueInterpreterV2Address, registrationPriority);

  let registration = createDerivativeRegistration(
    event.params.derivative,
    event.address,
    valueInterpreterV2Address,
    registrationPriority,
  );

  updateForDerivativeRegistration(registration, event);
}

export function handleDerivativeRemoved(event: DerivativeRemoved): void {
  initializeCurrencies(event);
  removeDerivativeRegistration(event.params.derivative, event.address);
}
