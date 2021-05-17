import { PrimitiveAdded, PrimitiveUpdated, PrimitiveRemoved } from '../generated/ChainlinkPriceFeedContract';
import { createOrUpdatePrimitiveRegistration, removePrimitiveRegistration } from './entities/Registration';

export function handlePrimitiveAdded(event: PrimitiveAdded): void {
  createOrUpdatePrimitiveRegistration(event.params.primitive, event.address, event.params.aggregator);
}

export function handlePrimitiveUpdated(event: PrimitiveUpdated): void {
  createOrUpdatePrimitiveRegistration(event.params.primitive, event.address, event.params.nextAggregator);
}

export function handlePrimitiveRemoved(event: PrimitiveRemoved): void {
  removePrimitiveRegistration(event.params.primitive, event.address);
}
