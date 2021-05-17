import {
  DerivativeAdded,
  DerivativeUpdated,
  DerivativeRemoved,
} from '../generated/AggregatedDerivativePriceFeedContract';
import { createOrUpdateDerivativeRegistration, removeDerivativeRegistration } from './entities/Registration';

export function handleDerivativeAdded(event: DerivativeAdded): void {
  createOrUpdateDerivativeRegistration(event.params.derivative, event.address);
}

export function handleDerivativeUpdated(event: DerivativeUpdated): void {
  createOrUpdateDerivativeRegistration(event.params.derivative, event.address);
}

export function handleDerivativeRemoved(event: DerivativeRemoved): void {
  removeDerivativeRegistration(event.params.derivative, event.address);
}
