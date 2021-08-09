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

export function handleDerivativeAdded(event: DerivativeAdded): void {
  initializeCurrencies(event);

  let registration = createDerivativeRegistration(event.params.derivative, 4, event);
  updateForDerivativeRegistration(registration, event);
}

export function handleDerivativeRemoved(event: DerivativeRemoved): void {
  initializeCurrencies(event);
  removeDerivativeRegistration(event.params.derivative, 4, event);
}

export function handlePrimitiveAdded(event: PrimitiveAdded): void {
  initializeCurrencies(event);

  let quote = event.params.rateAsset == 0 ? 'ETH' : 'USD';
  let registration = createOrUpdatePrimitiveRegistration(
    event.params.primitive,
    event.params.aggregator,
    4,
    event,
    quote,
  );
  updateForPrimitiveRegistration(registration, event);
}

export function handlePrimitiveRemoved(event: PrimitiveRemoved): void {
  initializeCurrencies(event);
  removePrimitiveRegistration(event.params.primitive, 4, event);
}

export function handleStalePrimitiveRemoved(event: StalePrimitiveRemoved): void {
  initializeCurrencies(event);
  removePrimitiveRegistration(event.params.primitive, 4, event);
}
