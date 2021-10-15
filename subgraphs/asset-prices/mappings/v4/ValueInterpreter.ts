import {
  DerivativeAdded,
  DerivativeRemoved,
  PrimitiveAdded,
  PrimitiveRemoved,
  StalePrimitiveRemoved,
} from '../../generated/contracts/ValueInterpreter4Events';
import {
  createDerivativeRegistration,
  removeDerivativeRegistration,
  createOrUpdatePrimitiveRegistration,
  removePrimitiveRegistration,
} from '../../entities/Registration';
import { initializeCurrencies } from '../../utils/initializeCurrencies';
import { updateForDerivativeRegistration } from '../../utils/updateForRegistration';
import { updateForPrimitiveRegistration } from '../../utils/updateForRegistration';
import { releaseV4Address } from '../../templates/configuration';

export function handleDerivativeAdded(event: DerivativeAdded): void {
  initializeCurrencies(event);

  let registration = createDerivativeRegistration(event.params.derivative, releaseV4Address, event);
  updateForDerivativeRegistration(registration, event);
}

export function handleDerivativeRemoved(event: DerivativeRemoved): void {
  initializeCurrencies(event);
  removeDerivativeRegistration(event.params.derivative, releaseV4Address, event);
}

export function handlePrimitiveAdded(event: PrimitiveAdded): void {
  initializeCurrencies(event);

  let quote = event.params.rateAsset == 0 ? 'ETH' : 'USD';
  let registration = createOrUpdatePrimitiveRegistration(
    event.params.primitive,
    event.params.aggregator,
    releaseV4Address,
    event,
    quote,
  );
  updateForPrimitiveRegistration(registration, event);
}

export function handlePrimitiveRemoved(event: PrimitiveRemoved): void {
  initializeCurrencies(event);
  removePrimitiveRegistration(event.params.primitive, releaseV4Address, event);
}

export function handleStalePrimitiveRemoved(event: StalePrimitiveRemoved): void {
  initializeCurrencies(event);
  removePrimitiveRegistration(event.params.primitive, releaseV4Address, event);
}
