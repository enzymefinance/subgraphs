import { DerivativeAdded, DerivativeRemoved } from '../../generated/contracts/AggregatedDerivativePriceFeed3Events';
import { createDerivativeRegistration, removeDerivativeRegistration } from '../../entities/Registration';
import { initializeCurrencies } from '../../utils/initializeCurrencies';
import { updateForDerivativeRegistration } from '../../utils/updateForRegistration';
import { releaseV3Address } from '../../templates/configuration';

export function handleDerivativeAdded(event: DerivativeAdded): void {
  initializeCurrencies(event);

  let registration = createDerivativeRegistration(event.params.derivative, releaseV3Address, event);
  updateForDerivativeRegistration(registration, event);
}

export function handleDerivativeRemoved(event: DerivativeRemoved): void {
  initializeCurrencies(event);
  removeDerivativeRegistration(event.params.derivative, releaseV3Address, event);
}
