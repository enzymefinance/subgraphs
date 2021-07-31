import {
  DerivativeAdded,
  DerivativeRemoved,
  PrimitiveAdded,
  PrimitiveRemoved,
  StalePrimitiveRemoved,
} from '../../generated/CombinedPriceFeedContract';
import {
  createDerivativeRegistration,
  removeDerivativeRegistration,
  createOrUpdatePrimitiveRegistration,
  removePrimitiveRegistration,
} from '../../entities/Registration';
import { initializeCurrencies } from '../../utils/initializeCurrencies';
import { updateForDerivativeRegistration } from '../../utils/updateForRegistration';
import { updateForPrimitiveRegistration } from '../../utils/updateForRegistration';
import { valueInterpreterV4Address } from '../../generated/configuration';

let registrationPriority = 3;

export function handleDerivativeAdded(event: DerivativeAdded): void {
  initializeCurrencies(event);
  createDerivativeRegistration(event.params.derivative, event.address, valueInterpreterV4Address, registrationPriority);

  let registration = createDerivativeRegistration(
    event.params.derivative,
    event.address,
    valueInterpreterV4Address,
    registrationPriority,
  );

  updateForDerivativeRegistration(registration, event);
}

export function handleDerivativeRemoved(event: DerivativeRemoved): void {
  initializeCurrencies(event);
  removeDerivativeRegistration(event.params.derivative, event.address);
}

export function handlePrimitiveAdded(event: PrimitiveAdded): void {
  initializeCurrencies(event);

  let quoteCurrency = event.params.rateAsset == 0 ? 'ETH' : 'USD';
  let registration = createOrUpdatePrimitiveRegistration(
    event.params.primitive,
    event.address,
    event.params.aggregator,
    valueInterpreterV4Address,
    registrationPriority,
    quoteCurrency,
  );

  updateForPrimitiveRegistration(registration, event);
}

export function handlePrimitiveRemoved(event: PrimitiveRemoved): void {
  initializeCurrencies(event);
  removePrimitiveRegistration(event.params.primitive, event.address);
}

export function handleStalePrimitiveRemoved(event: StalePrimitiveRemoved): void {
  initializeCurrencies(event);
  removePrimitiveRegistration(event.params.primitive, event.address);
}
