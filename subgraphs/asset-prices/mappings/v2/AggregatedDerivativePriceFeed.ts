import { DerivativeAdded, DerivativeRemoved } from '../../generated/contracts/AggregatedDerivativePriceFeed2Events';
import { createDerivativeRegistration, removeDerivativeRegistration } from '../../entities/Registration';
import { initializeCurrencies } from '../../utils/initializeCurrencies';
import { updateForDerivativeRegistration } from '../../utils/updateForRegistration';
import { releaseV2Address } from '../../generated/configuration';

export function handleDerivativeAdded(event: DerivativeAdded): void {
  initializeCurrencies(event);

  let registration = createDerivativeRegistration(
    event.params.derivative,
    event.params.priceFeed,
    releaseV2Address,
    event,
  );
  updateForDerivativeRegistration(registration, event);
}

export function handleDerivativeRemoved(event: DerivativeRemoved): void {
  initializeCurrencies(event);
  removeDerivativeRegistration(event.params.derivative, releaseV2Address, event);
}
